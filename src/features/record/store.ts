import { create } from 'zustand';
import { supabase } from '../../config/supabase';
import type { Record } from '../../shared/types';

interface RecordState {
  records: Record[];
  loading: boolean;
  fetchRecords: (userId?: string) => Promise<void>;
  createRecord: (record: Omit<Record, 'id' | 'created_at' | 'updated_at'>) => Promise<Record | null>;
  updateRecord: (id: string, updates: Partial<Record>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}

export const useRecordStore = create<RecordState>((set) => ({
  records: [],
  loading: false,

  fetchRecords: async (userId?: string) => {
    set({ loading: true });
    let query = supabase
      .from('records')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data } = await query;
    set({ records: (data as Record[]) ?? [], loading: false });
  },

  createRecord: async (record) => {
    const { data, error } = await supabase
      .from('records')
      .insert(record)
      .select()
      .single();
    if (error) throw error;
    set((s) => ({ records: [data as Record, ...s.records] }));
    return data as Record;
  },

  updateRecord: async (id, updates) => {
    const { error } = await supabase.from('records').update(updates).eq('id', id);
    if (error) throw error;
    set((s) => ({
      records: s.records.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
  },

  deleteRecord: async (id) => {
    const { error } = await supabase.from('records').delete().eq('id', id);
    if (error) throw error;
    set((s) => ({ records: s.records.filter((r) => r.id !== id) }));
  },
}));
