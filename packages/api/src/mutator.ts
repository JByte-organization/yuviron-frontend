// src/shared/api/mutator.ts

let getAccessToken: () => string | null = () => null;
let onUnauthorized: () => void = () => {};
let onTokenRefresh: (token: string) => void = () => {};
let configuredBaseUrl: string | null = null;

/**
 * Инициализация мутатора — вызывается один раз в ApiClientProvider.
 * Принимает геттер токена (читает из Zustand без подписки),
 * колбэк при истечении сессии и колбэк для сохранения нового токена после refresh.
 *
 * baseUrl (опционально) — переопределяет базовый URL API. client-app передаёт
 * относительный '/api-proxy' (same-origin Route Handler), чтобы куки бэкенда
 * (XSRF-TOKEN, refresh) были first-party — иначе со страницы dev.yuviron.com
 * куку с dev-api.yuviron.com не прочитать → refresh падает 400 → разлогин на F5.
 * admin не передаёт baseUrl и продолжает ходить напрямую.
 */
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
 * Базовый URL для API.
 * Приоритет: configureApiClient({ baseUrl }) → NEXT_PUBLIC_API_URL → прямой бэкенд.
 * configuredBaseUrl выставляется только в браузере (configureApiClient зовётся
 * в useEffect клиентского провайдера), поэтому SSR-запросы остаются абсолютными.
 */
const getBaseUrl = (): string => {
    return (
        configuredBaseUrl ??
        process.env.NEXT_PUBLIC_API_URL ??
        'https://dev-api.yuviron.com/api'
    );
};

/**
 * Читает CSRF-токен из куки XSRF-TOKEN (схема Double Submit Cookie).
 * На сервере (SSR) document недоступен — возвращаем пустую строку.
 */
const getCsrfToken = (): string => {
    if (typeof document === 'undefined') return '';
    const value = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/)?.[1];
    return value ? decodeURIComponent(value) : '';
};

/**
 * Инициализация CSRF-токена. Делает GET /auth/csrf-token — бэкенд ставит куки
 * XSRF-TOKEN (читаем мы) и yuviron_csrf (системная, браузер шлёт сам).
 * Вызывать один раз при старте приложения ДО любых мутирующих запросов
 * (refresh / logout / register), иначе бэк вернёт 400 без заголовка X-CSRF-TOKEN.
 */
export const initCsrfToken = async (): Promise<void> => {
    if (typeof document === 'undefined') return;
    try {
        await fetch(`${getBaseUrl()}/auth/csrf-token`, {
            method: 'GET',
            credentials: 'include',
        });
    } catch {
        // Молча: отсутствие куки проявится на первом мутирующем запросе.
    }
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
            'X-CSRF-TOKEN': getCsrfToken(),
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
 * Полный список по доке/Swagger: login/register/refresh плюс
 * восстановление пароля и OTP (send-code / login-with-code).
 */
const isAuthRoute = (url: string) =>
    url.includes('/auth/login') ||
    url.includes('/auth/login-with-code') ||
    url.includes('/auth/send-code') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/forgot-password') ||
    url.includes('/auth/reset-password') ||
    url.includes('/auth/confirm-email');

/**
 * Кастомный инстанс для Orval.
 * Запросы идут напрямую на бэкенд — CORS разрешён на стороне бэкенда.
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

        // Anti-CSRF (Double Submit Cookie): на все мутирующие запросы добавляем
        // заголовок X-CSRF-TOKEN со значением из куки XSRF-TOKEN. Бэк сверяет
        // заголовок с системной кукой yuviron_csrf (refresh / logout / register).
        const method = (options.method ?? 'GET').toUpperCase();
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            const csrf = getCsrfToken();
            if (csrf) headers.set('X-CSRF-TOKEN', csrf);
        }

        const baseUrl = getBaseUrl();

        // Убираем /api из пути — baseUrl уже содержит /api
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
            onUnauthorized();
            throw refreshError;
        } finally {
            isRefreshing = false;
        }
    }

    // --- Ошибки с телом ответа ---
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

    // --- Пустое тело ответа ---
    // Часть эндпоинтов (send-code, confirm-email и т.п.) отвечают 200 с ПУСТЫМ
    // телом. response.json() на пустом теле кидает SyntaxError — и успешный
    // запрос прилетал в onError ("Не вдалося надіслати код" при фактическом 200).
    // Читаем текст и парсим только непустой; 204 и пустой 200 → {}.
    if (response.status === 204) {
        return {} as T;
    }

    const rawText = await response.text();
    if (!rawText) {
        return {} as T;
    }
    return JSON.parse(rawText) as T;
};