import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Статика и API
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api')   ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Проверка наличия токена авторизации
    const token = request.cookies.get('admin_logged_in')?.value;

    const isAuthPage = pathname.startsWith('/login');

    // Если пользователь не авторизирован
    if (!token && !isAuthPage && pathname !== '/') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Если авторизован
    if (token && isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Редирект на dashboard
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}