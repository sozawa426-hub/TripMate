import { create } from 'zustand';
import { supabase } from '../../config/supabase';
import type { Checklist, ChecklistItem } from '../../shared/types';

interface ChecklistState {
  checklists: Checklist[];
  currentChecklist: Checklist | null;
  items: ChecklistItem[];
  loading: boolean;
  fetchChecklists: (tripId: string) => Promise<void>;
  fetchItems: (checklistId: string) => Promise<void>;
  toggleItem: (id: string, isChecked: boolean) => Promise<void>;
  addItem: (checklistId: string, category: string, name: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export const useChecklistStore = create<ChecklistState>((set) => ({
  checklists: [],
  currentChecklist: null,
  items: [],
  loading: false,

  fetchChecklists: async (tripId) => {
    set({ loading: true });
    const { data } = await supabase
      .from('checklists')
      .select('*')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });
    set({ checklists: (data as Checklist[]) ?? [], loading: false });
  },

  fetchItems: async (checklistId) => {
    const { data } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('checklist_id', checklistId)
      .order('sort_order');
    set({ items: (data as ChecklistItem[]) ?? [] });
  },

  toggleItem: async (id, isChecked) => {
    await supabase.from('checklist_items').update({ is_checked: !isChecked }).eq('id', id);
    set((s) => ({
      items: s.items.map((item) =>
        item.id === id ? { ...item, is_checked: !isChecked } : item,
      ),
    }));
  },

  addItem: async (checklistId, category, name) => {
    const { data } = await supabase
      .from('checklist_items')
      .insert({ checklist_id: checklistId, category, name })
      .select()
      .single();
    if (data) set((s) => ({ items: [...s.items, data as ChecklistItem] }));
  },

  deleteItem: async (id) => {
    await supabase.from('checklist_items').delete().eq('id', id);
    set((s) => ({ items: s.items.filter((item) => item.id !== id) }));
  },
}));
