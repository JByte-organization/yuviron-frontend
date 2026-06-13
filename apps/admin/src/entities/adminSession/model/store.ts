import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// TYPES

interface AdminSessionState {
    adminAccessToken: string | null;
    setAdminAccessToken: (token: string | null) => void;
    clearAdminSession:   () => void;
}

// STORE

export const useAdminSessionStore = create<AdminSessionState>()(
    persist(
        (set) => ({
            adminAccessToken: null,

            setAdminAccessToken: (token) => set({ adminAccessToken: token }),

            clearAdminSession: () => set({ adminAccessToken: null }),
        }),
        {
            name: 'admin-session-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);