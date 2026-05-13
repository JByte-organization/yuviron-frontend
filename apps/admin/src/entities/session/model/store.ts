import { create } from 'zustand';
import Cookies from 'js-cookie';

interface SessionState {
    accessToken: string | null;
    userRole: string | null;
    setAuth: (token: string | null, role: string | null) => void;
    setAccessToken: (token: string | null) => void; // ← додати
}

export const useSessionStore = create<SessionState>((set) => ({
    accessToken: Cookies.get('accessToken') || null,
    userRole: Cookies.get('userRole') || null,

    setAuth: (token, role) => {
        if (token && role) {
            // ВАЖЛИВО: встановлюємо path: '/', щоб куки були доступні на всіх сторінках
            Cookies.set('accessToken', token, { expires: 7, path: '/' });
            Cookies.set('userRole', role, { expires: 7, path: '/' });
            set({ accessToken: token, userRole: role });
        } else {
            Cookies.remove('accessToken', { path: '/' });
            Cookies.remove('userRole', { path: '/' });
            set({ accessToken: null, userRole: null });
        }
    },
    setAccessToken: (token: string | null) => {
        if (token) {
            Cookies.set('accessToken', token, { expires: 7, path: '/' });
            set({ accessToken: token });
        } else {
            Cookies.remove('accessToken', { path: '/' });
            set({ accessToken: null });
        }
    },
}));