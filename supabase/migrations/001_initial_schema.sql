-- TripMate データベーススキーマ
-- Supabase で実行するための SQL

-- updated_at を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- users テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'ja',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- trips テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  budget_total INTEGER,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'ongoing', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- itineraries テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- itinerary_items テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
  time_start TIME,
  time_end TIME,
  title TEXT NOT NULL,
  description TEXT,
  location_name TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  transport_method TEXT,
  sort_order INTEGER DEFAULT 0
);

-- ============================================
-- checklists テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- checklist_items テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

-- ============================================
-- budget_entries テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS budget_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  category TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'JPY',
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- budget_daily_limits テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS budget_daily_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  limit_amount INTEGER NOT NULL,
  UNIQUE(trip_id, day_number)
);

-- ============================================
-- records テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
  location_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_records_updated_at
  BEFORE UPDATE ON records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- record_images テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS record_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES records(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- user_preferences テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  preferred_genres TEXT[] DEFAULT '{}',
  preferred_seasons TEXT[] DEFAULT '{}',
  preferred_budget_range TEXT CHECK (preferred_budget_range IN ('low', 'medium', 'high')),
  visited_places TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RLS（Row Level Security）ポリシー
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_daily_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE record_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- users: 自分のレコードのみ参照・更新可
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- trips: 自分のもののみ
CREATE POLICY "Users can view own trips" ON trips
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trips" ON trips
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trips" ON trips
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trips" ON trips
  FOR DELETE USING (auth.uid() = user_id);

-- itineraries: 紐づく trip の所有者のみ
CREATE POLICY "Users can view own itineraries" ON itineraries
  FOR SELECT USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = itineraries.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Users can manage own itineraries" ON itineraries
  FOR ALL USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = itineraries.trip_id AND trips.user_id = auth.uid()));

-- itinerary_items: 紐づく itinerary の所有者のみ
CREATE POLICY "Users can view own itinerary_items" ON itinerary_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM itineraries
    JOIN trips ON trips.id = itineraries.trip_id
    WHERE itineraries.id = itinerary_items.itinerary_id AND trips.user_id = auth.uid()
  ));
CREATE POLICY "Users can manage own itinerary_items" ON itinerary_items
  FOR ALL USING (EXISTS (
    SELECT 1 FROM itineraries
    JOIN trips ON trips.id = itineraries.trip_id
    WHERE itineraries.id = itinerary_items.itinerary_id AND trips.user_id = auth.uid()
  ));

-- checklists: 紐づく trip の所有者のみ
CREATE POLICY "Users can view own checklists" ON checklists
  FOR SELECT USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = checklists.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Users can manage own checklists" ON checklists
  FOR ALL USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = checklists.trip_id AND trips.user_id = auth.uid()));

-- checklist_items: 紐づく checklist の所有者のみ
CREATE POLICY "Users can view own checklist_items" ON checklist_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM checklists
    JOIN trips ON trips.id = checklists.trip_id
    WHERE checklists.id = checklist_items.checklist_id AND trips.user_id = auth.uid()
  ));
CREATE POLICY "Users can manage own checklist_items" ON checklist_items
  FOR ALL USING (EXISTS (
    SELECT 1 FROM checklists
    JOIN trips ON trips.id = checklists.trip_id
    WHERE checklists.id = checklist_items.checklist_id AND trips.user_id = auth.uid()
  ));

-- budget_entries: 紐づく trip の所有者のみ
CREATE POLICY "Users can view own budget_entries" ON budget_entries
  FOR SELECT USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = budget_entries.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Users can manage own budget_entries" ON budget_entries
  FOR ALL USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = budget_entries.trip_id AND trips.user_id = auth.uid()));

-- budget_daily_limits: 紐づく trip の所有者のみ
CREATE POLICY "Users can view own budget_daily_limits" ON budget_daily_limits
  FOR SELECT USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = budget_daily_limits.trip_id AND trips.user_id = auth.uid()));
CREATE POLICY "Users can manage own budget_daily_limits" ON budget_daily_limits
  FOR ALL USING (EXISTS (SELECT 1 FROM trips WHERE trips.id = budget_daily_limits.trip_id AND trips.user_id = auth.uid()));

-- records: public なら全員参照可、private なら自分のみ
CREATE POLICY "Anyone can view public records" ON records
  FOR SELECT USING (visibility = 'public');
CREATE POLICY "Users can view own records" ON records
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own records" ON records
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own records" ON records
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own records" ON records
  FOR DELETE USING (auth.uid() = user_id);

-- record_images: 紐づく record のアクセス権に準拠
CREATE POLICY "Anyone can view public record_images" ON record_images
  FOR SELECT USING (EXISTS (SELECT 1 FROM records WHERE records.id = record_images.record_id AND records.visibility = 'public'));
CREATE POLICY "Users can view own record_images" ON record_images
  FOR SELECT USING (EXISTS (SELECT 1 FROM records WHERE records.id = record_images.record_id AND records.user_id = auth.uid()));
CREATE POLICY "Users can manage own record_images" ON record_images
  FOR ALL USING (EXISTS (SELECT 1 FROM records WHERE records.id = record_images.record_id AND records.user_id = auth.uid()));

-- user_preferences: 自分のもののみ
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- インデックス
-- ============================================
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_dates ON trips(start_date, end_date);
CREATE INDEX idx_itineraries_trip_id ON itineraries(trip_id);
CREATE INDEX idx_itinerary_items_itinerary_id ON itinerary_items(itinerary_id);
CREATE INDEX idx_checklists_trip_id ON checklists(trip_id);
CREATE INDEX idx_checklist_items_checklist_id ON checklist_items(checklist_id);
CREATE INDEX idx_budget_entries_trip_id ON budget_entries(trip_id);
CREATE INDEX idx_records_user_id ON records(user_id);
CREATE INDEX idx_records_visibility ON records(visibility);
CREATE INDEX idx_record_images_record_id ON record_images(record_id);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
