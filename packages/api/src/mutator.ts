// src/shared/api/mutator.ts

import { getDeviceFingerprint } from './fingerprint';

export interface ApiErrorResponse extends Error {
    response?: {
        status: number;
        data: unknown;
    };
}

let getAccessToken: () => string | null = () => null;
let onUnauthorized: () => void = () => {};
let onTokenRefresh: (token: string) => void = () => {};
let configuredBaseUrl: string | null = null;

export const configureApiClient = (config: {
    getToken: () => string | null;
    onUnauthorized: () => void;
    onTokenRefresh: (token: string) => void;
    baseUrl?: string;
}) => {
    getAccessToken = config.getToken;
    onUnauthorized = config.onUnauthorized;
    onTokenRefresh = config.onTokenRefresh;
    if (config.baseUrl !== undefined) configuredBaseUrl = config.baseUrl;
};

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token!);
    });
    failedQueue = [];
};

const getBaseUrl = (): string => {
    return (
        configuredBaseUrl ??
        process.env.NEXT_PUBLIC_API_URL ??
        'https://dev-api.yuviron.com/api'
    );
};

const getCsrfToken = (): string => {
    if (typeof document === 'undefined') return '';
    const value = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/)?.[1];
    return value ? decodeURIComponent(value) : '';
};

export const initCsrfToken = async (): Promise<void> => {
    if (typeof document === 'undefined') return;
    try {
        await fetch(`${getBaseUrl()}/auth/csrf-token`, {
            method: 'GET',
            credentials: 'include',
            headers: await fingerprintHeaders(),
        });
    } catch {}
};

const fingerprintHeaders = async (): Promise<Record<string, string>> => {
    const fingerprint = await getDeviceFingerprint();
    return fingerprint ? { 'X-Device-Fingerprint': fingerprint } : {};
};

/**
 * ОПРЕДЕЛЯЕМ, КТО ДЕЛАЕТ ЗАПРОС:
 * Если configuredBaseUrl отсутствует, значит это админ-панель (ходит напрямую).
 */
const isAdminApp = (): boolean => !configuredBaseUrl;

const refreshAccessToken = async (): Promise<string> => {
    const baseUrl = getBaseUrl();

    // ИСПРАВЛЕНО: Если это админка, рефрешимся через админский эндпоинт, иначе через клиентский
    const refreshUrl = isAdminApp()
        ? `${baseUrl}/auth/refresh` // Если бэк общий, но требует заголовков, или поменяй на /auth/admin/refresh при необходимости
        : `${baseUrl}/auth/refresh`;

    const response = await fetch(refreshUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'X-CSRF-TOKEN': getCsrfToken(),
            ...(await fingerprintHeaders()),
        },
    });

    if (!response.ok) throw new Error('Refresh failed');

    const data = await response.json();
    const token = data.accessToken ?? data.token;

    if (!token) throw new Error('No token in refresh response');
    return token;
};

const isAuthRoute = (url: string) =>
    url.includes('/auth/login') ||
    url.includes('/auth/admin/login') ||
    url.includes('/auth/admin/pre-login') ||
    url.includes('/auth/login-with-code') ||
    url.includes('/auth/send-code') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/forgot-password') ||
    url.includes('/auth/reset-password') ||
    url.includes('/auth/confirm-email');

export const customInstance = async <T>(
    url: string,
    options: RequestInit,
): Promise<T> => {
    const authRoute = isAuthRoute(url);
    const deviceFingerprint = await getDeviceFingerprint();

    const makeRequest = async (token: string | null): Promise<Response> => {
        const headers = new Headers(options.headers);

        if (options.body && !(options.body instanceof FormData)) {
            headers.set('Content-Type', 'application/json');
        }

        if (token && !authRoute) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        if (deviceFingerprint) {
            headers.set('X-Device-Fingerprint', deviceFingerprint);
        }

        const method = (options.method ?? 'GET').toUpperCase();
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            const csrf = getCsrfToken();
            if (csrf) headers.set('X-CSRF-TOKEN', csrf);
        }

        const baseUrl = getBaseUrl();
        const path = url.startsWith('/api') ? url.slice(4) : url;

        return fetch(`${baseUrl}${path}`, {
            ...options,
            headers,
            credentials: 'include',
        });
    };

    let token = getAccessToken();
    let response = await makeRequest(token);

    // --- 401: токен истёк, пробуем обновить ---
    if (response.status === 401 && !authRoute) {
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: async (newToken: string) => {
                        try {
                            const retryResponse = await makeRequest(newToken);
                            const data = await retryResponse.json();
                            resolve(data);
                        } catch (e) {
                            reject(e);
                        }
                    },
                    reject,
                });
            });
        }

        isRefreshing = true;

        try {
            const newToken = await refreshAccessToken();
            onTokenRefresh(newToken);
            processQueue(null, newToken);
            response = await makeRequest(newToken);
        } catch (refreshError) {
            processQueue(refreshError, null);

            // Чистим куку админа при падении рефреша
            if (typeof window !== 'undefined') {
                document.cookie = "admin_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
            }

            onUnauthorized();
            throw refreshError;
        } finally {
            isRefreshing = false;
        }
    }

    if (!response.ok) {
        const rawText = await response.text();
        let errorData: any = {};
        if (rawText) {
            try {
                errorData = JSON.parse(rawText);
            } catch {
                errorData = { rawText };
            }
        }
        console.log('[api] error', response.status, url, rawText || '<empty body>');
        const err: any = new Error('API Error');
        err.response = { status: response.status, data: errorData };
        throw err;
    }

    if (response.status === 204) {
        return {} as T;
    }

    const rawText = await response.text();
    if (!rawText) {
        return {} as T;
    }
    return JSON.parse(rawText) as T;
};