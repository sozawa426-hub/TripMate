import { create } from 'zustand';
import { supabase } from '../../config/supabase';
import type { Trip, Itinerary, ItineraryItem } from '../../shared/types';

interface ItineraryState {
  trips: Trip[];
  currentTrip: Trip | null;
  itineraries: Itinerary[];
  items: ItineraryItem[];
  loading: boolean;
  fetchTrips: (userId: string) => Promise<void>;
  createTrip: (trip: Omit<Trip, 'id' | 'created_at' | 'updated_at'>) => Promise<Trip | null>;
  fetchItineraries: (tripId: string) => Promise<void>;
  fetchItems: (itineraryId: string) => Promise<void>;
  updateItemOrder: (items: ItineraryItem[]) => void;
}

export const useItineraryStore = create<ItineraryState>((set) => ({
  trips: [],
  currentTrip: null,
  itineraries: [],
  items: [],
  loading: false,

  fetchTrips: async (userId) => {
    set({ loading: true });
    const { data } = await supabase
      .from('trips')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: true });
    set({ trips: (data as Trip[]) ?? [], loading: false });
  },

  createTrip: async (trip) => {
    const { data, error } = await supabase.from('trips').insert(trip).select().single();
    if (error) throw error;
    set((s) => ({ trips: [...s.trips, data as Trip] }));
    return data as Trip;
  },

  fetchItineraries: async (tripId) => {
    const { data } = await supabase
      .from('itineraries')
      .select('*')
      .eq('trip_id', tripId)
      .order('day_number');
    set({ itineraries: (data as Itinerary[]) ?? [] });
  },

  fetchItems: async (itineraryId) => {
    const { data } = await supabase
      .from('itinerary_items')
      .select('*')
      .eq('itinerary_id', itineraryId)
      .order('sort_order');
    set({ items: (data as ItineraryItem[]) ?? [] });
  },

  updateItemOrder: (items) => set({ items }),
}));
