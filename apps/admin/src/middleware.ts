import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value;
    const role = request.cookies.get('userRole')?.value;
    const { pathname } = request.nextUrl;

    // 1. Пропускаємо статичні файли та API, щоб не було помилок завантаження
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // 2. Якщо користувач вже на сторінці логіну
    if (pathname === '/login') {
        // Якщо він вже авторизований як адмін — перекидаємо в адмінку
        if (token && role === 'admin') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        // Якщо ні — просто даємо сторінці /login завантажитись
        return NextResponse.next();
    }

    // 3. Захист будь-якого шляху, крім логіна (включаючи корінь "/" та "/admin-dashboard")
    // Якщо немає токена АБО роль не адмін — відправляємо на логін
    if (!token || role !== 'admin') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 4. Якщо авторизований адмін заходить на корінь "/" — шлемо в адмінку
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Маска: перевіряти все, крім технічних шляхів Next.js
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};