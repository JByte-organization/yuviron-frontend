// src/shared/api/mutator.ts

let getAccessToken: () => string | null = () => null;
let onUnauthorized: () => void = () => {};
let onTokenRefresh: (token: string) => void = () => {};

/**
 * Инициализация мутатора — вызывается один раз в ApiClientProvider.
 * Принимает геттер токена (читает из Zustand без подписки),
 * колбэк при истечении сессии и колбэк для сохранения нового токена после refresh.
 */
export const configureApiClient = (config: {
    getToken: () => string | null;
    onUnauthorized: () => void;
    onTokenRefresh: (token: string) => void;
}) => {
    getAccessToken = config.getToken;
    onUnauthorized = config.onUnauthorized;
    onTokenRefresh = config.onTokenRefresh;
};

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

/**
 * Обрабатывает очередь запросов, ожидавших обновления токена.
 */
const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token!);
    });
    failedQueue = [];
};

/**
 * Базовый URL для API:
 * - Локально (.env.local):     NEXT_PUBLIC_API_URL=/api-proxy  → запросы через Route Handler
 * - На сервере (.env.production): NEXT_PUBLIC_API_URL=https://dev-api.yuviron.com/api → напрямую
 */
const getBaseUrl = (): string => {
    return process.env.NEXT_PUBLIC_API_URL ?? '/api-proxy';
};

/**
 * Запрашивает новую пару токенов через HttpOnly Cookie с Refresh токеном.
 */
const refreshAccessToken = async (): Promise<string> => {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'X-CSRF-Protection': '1',
        },
    });

    if (!response.ok) throw new Error('Refresh failed');

    const data = await response.json();
    const token = data.accessToken ?? data.token;

    if (!token) throw new Error('No token in refresh response');
    return token;
};

/**
 * Публичные роуты — не требуют заголовка Authorization.
 */
const isAuthRoute = (url: string) =>
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/send-login-code') ||
    url.includes('/auth/login-with-code');

/**
 * Кастомный инстанс для Orval.
 * Вместо Axios использует Fetch с логикой Refresh Token и очередью запросов.
 *
 * Локально:  запросы идут через /api-proxy (Next.js Route Handler) → обходит CORS и DNS
 * На сервере: запросы идут напрямую на https://dev-api.yuviron.com/api → CORS разрешён
 */
export const customInstance = async <T>(
    url: string,
    options: RequestInit,
): Promise<T> => {
    const authRoute = isAuthRoute(url);

    const makeRequest = async (token: string | null): Promise<Response> => {
        const headers = new Headers(options.headers);

        // JSON content-type для тела, кроме FormData
        if (options.body && !(options.body instanceof FormData)) {
            headers.set('Content-Type', 'application/json');
        }

        // Bearer токен для всех не-публичных роутов
        if (token && !authRoute) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        const baseUrl = getBaseUrl();

        // Убираем /api из пути — baseUrl уже содержит /api или /api-proxy
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
            // Встаём в очередь — ждём пока другой запрос обновит токен
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

            // Сохраняем новый токен в Zustand стор через колбэк
            onTokenRefresh(newToken);

            // Отдаём новый токен всем запросам из очереди
            processQueue(null, newToken);

            // Повторяем оригинальный запрос с новым токеном
            response = await makeRequest(newToken);
        } catch (refreshError) {
            processQueue(refreshError, null);
            // Refresh провалился — разлогиниваем пользователя
            onUnauthorized();
            throw refreshError;
        } finally {
            isRefreshing = false;
        }
    }

    // --- Ошибки с телом ответа (400, 409, 404, 500 и т.д.) ---
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

    // --- 204 No Content ---
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
};