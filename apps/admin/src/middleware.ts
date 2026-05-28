import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ══════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════

/**
 * Декодує payload JWT без верифікації підпису.
 * Middleware не має доступу до секрету — верифікація на бекенді.
 */
const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
    try {
        const part = token.split('.')[1];
        if (!part) return null;
        return JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
        return null;
    }
};

const hasAdminPermission = (token: string): boolean => {
    const payload = decodeJwtPayload(token);
    return payload?.session_type === 'admin';
};

const isTokenExpired = (token: string): boolean => {
    const payload = decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== 'number') return true;
    return Date.now() / 1000 > payload.exp;
};

// ══════════════════════════════════════════════════════════
// MIDDLEWARE
// ══════════════════════════════════════════════════════════
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Пропускаємо системні шляхи
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api')   ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Токен зберігається в Zustand (in-memory) — при SSR його немає.
    // Тому для middleware перевіряємо HttpOnly куку refreshToken як індикатор
    // що сесія могла бути активна. Реальна валідація — на рівні ApiClientProvider.
    const adminToken = request.cookies.get('adminToken')?.value;

    const isLoginPage = pathname === '/login';

    if (isLoginPage) {
        // Якщо є валідний токен з правами — редірект на dashboard
        if (adminToken && !isTokenExpired(adminToken) && hasAdminPermission(adminToken)) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // Захищені маршрути — перевіряємо токен
    if (!adminToken || isTokenExpired(adminToken) || !hasAdminPermission(adminToken)) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Редірект з / на /dashboard
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}