import axios from "axios";
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { useAdminSessionStore } from "@/entities/adminSession/model/store";

// 1. ХЕЛПЕР ДЛЯ ЧТЕННЯ CSRF КУКИ
const getCsrfToken = () => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'));
    const tokenValue = match?.[2];
    return tokenValue ? decodeURIComponent(tokenValue) : '';
};

// 2. ХЕЛПЕР ДЛЯ GENERATION & CACHING FINGERPRINT (З захистом від падіння в SSR)
const getDeviceFingerprint = async (): Promise<string> => {
    if (typeof window === 'undefined') return '';

    const STORAGE_KEY = 'device_fingerprint';
    let fpId = localStorage.getItem(STORAGE_KEY);

    if (!fpId) {
        try {
            const fp = await FingerprintJS.load();
            const result = await fp.get();
            fpId = result.visitorId;
            localStorage.setItem(STORAGE_KEY, fpId);
        } catch (error) {
            console.error('Failed to generate device fingerprint:', error);
            return '';
        }
    }

    return fpId;
};

// 3. ІНІЦІАЛІЗАЦІЯ КЛІЄНТА
export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '',
    withCredentials: true,
});

// 4. ГЛОБАЛЬНИЙ ІНТЕРЦЕПТОР ЗАПИТІВ (Bearer + CSRF + Fingerprint)
apiClient.interceptors.request.use(async (config) => {
    // а) Додаємо токен авторизації
    const token = useAdminSessionStore.getState().adminAccessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // б) CSRF-заголовок для захисту мутуючих методів
    if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
        const csrfToken = getCsrfToken();
        if (csrfToken) {
            config.headers['X-CSRF-TOKEN'] = csrfToken;
        }
    }

    // в) ВПРОВАДЖЕННЯ FINGERPRINT ЗГІДНО З ТЗ БЕКЕНДУ
    try {
        const fingerprint = await getDeviceFingerprint();
        if (fingerprint) {
            config.headers['X-Device-Fingerprint'] = fingerprint;
        }
    } catch (fpError) {
        console.error("Failed to attach device fingerprint header", fpError);
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// 5. ІНТЕРЦЕПТОР ВІДПОВІДЕЙ (Авто-рефреш сесії 401)
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const res = await axios.post(`${apiClient.defaults.baseURL}/api/auth/refresh`, {}, {
                    withCredentials: true,
                    headers: {
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'X-Device-Fingerprint': await getDeviceFingerprint()
                    }
                });

                const newToken = res.data.token || res.data.adminAccessToken;
                useAdminSessionStore.getState().setAdminAccessToken(newToken);

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                useAdminSessionStore.getState().setAdminAccessToken('');
                if (typeof window !== 'undefined') {
                    window.location.href = '/admin/login';
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);