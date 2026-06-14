import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AdminSessionState {
    adminAccessToken: string | null;
    setAdminAccessToken: (token: string | null) => void;
    clearAdminSession:   () => void;
}

export const useAdminSessionStore = create<AdminSessionState>()(
    persist(
        (set) => ({
            adminAccessToken: null,
            setAdminAccessToken: (token) => set({ adminAccessToken: token }),
            clearAdminSession: () => set({ adminAccessToken: null }),
        }),
        {
            name: 'admin-session-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);