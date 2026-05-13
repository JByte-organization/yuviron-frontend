import { create } from 'zustand';
import Cookies from 'js-cookie';

interface SessionState {
    accessToken: string | null;
    userRole: string | null;
    setAuth: (token: string | null, role: string | null) => void;
    setAccessToken: (token: string | null) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
    accessToken: null,
    userRole: Cookies.get('userRole') || null,

    setAuth: (token, role) => {
        if (token && role) {
            Cookies.set('userRole', role, { expires: 7, path: '/' });
        } else {
            Cookies.remove('userRole', { path: '/' });
        }
        set({ accessToken: token, userRole: role });
    },

    setAccessToken: (token) => {
        set({ accessToken: token });
    },
}));