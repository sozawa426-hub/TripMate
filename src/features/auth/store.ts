import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  isAuthenticated: boolean;
  setSession: (session: Session | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isAuthenticated: false,
  setSession: (session) => set({ session, isAuthenticated: !!session }),
  logout: () => set({ session: null, isAuthenticated: false }),
}));
