import axios, { AxiosRequestConfig, AxiosError } from "axios";
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { useAdminSessionStore } from "@/entities/adminSession/model/store";

// Константы для кук и регулярных выражений
const CSRF_REGEXP = /(^| )XSRF-TOKEN=([^;]+)/;
const ADMIN_LOGGED_IN_COOKIE = "admin_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";

// 1. ХЕЛПЕР ДЛЯ ЧТЕННЯ CSRF КУКИ
const getCsrfToken = (): string => {
    if (typeof document === 'undefined') return '';
    const match = document.cookie.match(CSRF_REGEXP);
    return match?.[2] ? decodeURIComponent(match[2]) : '';
};

// 2. ХЕЛПЕР ДЛЯ GENERATION & CACHING FINGERPRINT
let cachedFingerprint: string | null = null;

const getDeviceFingerprint = async (): Promise<string> => {
    if (typeof window === 'undefined') return '';
    if (cachedFingerprint) return cachedFingerprint;

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

    cachedFingerprint = fpId;
    return fpId;
};

// 3. ІНІЦІАЛІЗАЦІЯ КЛІЄНТА
export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '',
    withCredentials: true,
});

// Описываем строгий интерфейс для элементов нашей очереди отложенных запросов
interface FailedRequestSubscriber {
    resolve: (token: string) => void;
    reject: (error: AxiosError) => void;
}

// Переменные для предотвращения race condition при рефреше
let isRefreshing = false;
let failedQueue: FailedRequestSubscriber[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null): void => {
    failedQueue.forEach((subscriber) => {
        if (error) {
            subscriber.reject(error);
        } else if (token) {
            subscriber.resolve(token);
        }
    });
    failedQueue = [];
};

// 4. ГЛОБАЛЬНИЙ ІНТЕРЦЕПТОР ЗАПИТІВ
apiClient.interceptors.request.use(async (config) => {
    const token = useAdminSessionStore.getState().adminAccessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
        const csrfToken = getCsrfToken();
        if (csrfToken) {
            config.headers['X-CSRF-TOKEN'] = csrfToken;
        }
    }

    try {
        const fingerprint = await getDeviceFingerprint();
        if (fingerprint) {
            config.headers['X-Device-Fingerprint'] = fingerprint;
        }
    } catch (fpError) {
        console.error("Failed to attach device fingerprint header", fpError);
    }

    return config;
}, (error: AxiosError) => {
    return Promise.reject(error);
});

// 5. ІНТЕРЦЕПТОР ВІДПОВІДЕЙ
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;

        // Если config отсутствует (редкий случай жестких сетевых ошибок), просто пробрасываем ошибку дальше
        if (!originalRequest) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !(originalRequest as AxiosRequestConfig & { _retry?: boolean })._retry) {
            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                            }
                            resolve(token);
                        },
                        reject: (err: AxiosError) => {
                            reject(err);
                        }
                    });
                }).then((token) => {
                    return apiClient(originalRequest);
                });
            }

            (originalRequest as AxiosRequestConfig & { _retry?: boolean })._retry = true;
            isRefreshing = true;

            try {
                const res = await axios.post<{ token?: string; adminAccessToken?: string }>(
                    `${apiClient.defaults.baseURL}/api/auth/refresh`,
                    {},
                    {
                        withCredentials: true,
                        headers: {
                            'X-CSRF-TOKEN': getCsrfToken(),
                            'X-Device-Fingerprint': await getDeviceFingerprint()
                        }
                    }
                );

                const newToken = res.data.token || res.data.adminAccessToken;

                if (!newToken) {
                    throw new Error("No token received during token refresh");
                }

                useAdminSessionStore.getState().setAdminAccessToken(newToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }

                processQueue(null, newToken);
                isRefreshing = false;

                return apiClient(originalRequest);
            } catch (refreshError) {
                // Преобразуем ошибку рефреша к типу AxiosError для очереди
                const finalError = refreshError instanceof AxiosError ? refreshError : error;

                processQueue(finalError, null);
                isRefreshing = false;

                useAdminSessionStore.getState().clearAdminSession();

                if (typeof window !== 'undefined') {
                    document.cookie = ADMIN_LOGGED_IN_COOKIE;
                    window.location.href = '/admin/login';
                }
                return Promise.reject(finalError);
            }
        }
        return Promise.reject(error);
    }
);