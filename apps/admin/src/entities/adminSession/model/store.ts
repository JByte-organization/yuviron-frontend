import { create } from 'zustand';

// ══════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════
interface AdminSessionState {
    adminAccessToken: string | null;
    setAdminAccessToken: (token: string | null) => void;
    clearAdminSession:   () => void;
}

// ══════════════════════════════════════════════════════════
// STORE
// Ізольований від клієнтського useSessionStore —
// щоб логаут адміна не ламав клієнтську сесію
// ══════════════════════════════════════════════════════════
export const useAdminSessionStore = create<AdminSessionState>(set => ({
    adminAccessToken: null,

    setAdminAccessToken: token => set({ adminAccessToken: token }),

    clearAdminSession: () => set({ adminAccessToken: null }),
}));