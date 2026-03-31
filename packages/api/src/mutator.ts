export const customInstance = async <T>(
    url: string,
    options: RequestInit
): Promise<T> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const headers = new Headers(options.headers);

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`https://dev-api.yuviron.com${url}`, {
        ...options,
        headers,
    });

    // 401
    if (response.status === 401 && typeof window !== 'undefined') {
        // localStorage.removeItem('auth_token');
        // window.location.href = '/login';
    }

    return response.json();
};