import { create } from 'zustand';
import api from '../utils/api';

export const useProfileStore = create((set, get) => ({
  profile: null,
  loading: false,
  error: null,
  
  fetchProfile: async () => {
    // Prevent redundant refetching if already loading
    if (get().loading) return;
    
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/api/business/profile');
      set({ profile: data, loading: false });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      set({ error: error.message, loading: false });
    }
  },

  updateProfileLocally: (updatedData) => {
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updatedData } : null
    }));
  }
}));