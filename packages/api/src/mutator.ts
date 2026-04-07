export const customInstance = async <T>(url: string, options: RequestInit): Promise<T> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register');

    // Создаём чистые заголовки
    const headers = new Headers();

    // Content-Type только если есть body
    if (options.body) {
        headers.set('Content-Type', 'application/json');
    }

    // Authorization — только для не-auth роутов
    if (token && !isAuthRoute) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`https://dev-api.yuviron.com${url}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw error;
    }

    // Для 204 No Content — не парсим JSON
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
};