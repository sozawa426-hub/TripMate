export interface User {
  id: string;
  display_name: string;
  avatar_url: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget_total: number | null;
  status: 'planned' | 'ongoing' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Itinerary {
  id: string;
  trip_id: string;
  day_number: number;
  created_at: string;
}

export interface ItineraryItem {
  id: string;
  itinerary_id: string;
  time_start: string | null;
  time_end: string | null;
  title: string;
  description: string | null;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  transport_method: string | null;
  sort_order: number;
}

export interface Checklist {
  id: string;
  trip_id: string;
  name: string;
  is_template: boolean;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  category: string;
  name: string;
  is_checked: boolean;
  sort_order: number;
}

export interface BudgetEntry {
  id: string;
  trip_id: string;
  day_number: number;
  category: string;
  amount: number;
  currency: string;
  memo: string | null;
  created_at: string;
}

export interface BudgetDailyLimit {
  id: string;
  trip_id: string;
  day_number: number;
  limit_amount: number;
}

export interface Record {
  id: string;
  user_id: string;
  trip_id: string | null;
  title: string;
  body: string;
  date_from: string;
  date_to: string;
  visibility: 'public' | 'private';
  location_tags: string[];
  created_at: string;
  updated_at: string;
}

export interface RecordImage {
  id: string;
  record_id: string;
  storage_path: string;
  sort_order: number;
  created_at: string;
}

export interface UserPreference {
  id: string;
  user_id: string;
  preferred_genres: string[];
  preferred_seasons: string[];
  preferred_budget_range: string | null;
  visited_places: string[];
  updated_at: string;
}
