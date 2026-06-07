// Ручной прокси на бэк. Заменяет Next.js rewrites потому что встроенный
// rewrite-прокси Next 16 не уважает NODE_TLS_REJECT_UNAUTHORIZED и падает
// на внутреннем CA dev-сертификата. Здесь fetch — это нативный undici,
// который env-флаг подхватывает корректно.

import { NextRequest } from 'next/server';

const BACKEND_BASE = process.env.BACKEND_URL ?? 'https://dev-api.yuviron.com/api';

// dev-api отдаёт сертификат внутреннего CA, которого нет в bundled-списке Node.
// Локально это решает cross-env NODE_TLS_REJECT_UNAUTHORIZED=0 в dev-скрипте,
// но в задеплоенном контейнере env не выставлен — без этого хака прокси падал бы
// в 502 на TLS. Включаем ТОЛЬКО для dev-бэкенда: прод обязан задать BACKEND_URL
// с публично доверенным сертификатом, и валидация останется включённой.
if (
    BACKEND_BASE.includes('dev-api.yuviron.com') &&
    process.env.NODE_TLS_REJECT_UNAUTHORIZED === undefined
) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const HOP_BY_HOP_REQUEST_HEADERS = new Set([
    'host',
    'connection',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailer',
    'transfer-encoding',
    'upgrade',
    'x-forwarded-for',
    'x-forwarded-host',
    'x-forwarded-proto',
]);

const HOP_BY_HOP_RESPONSE_HEADERS = new Set([
    'connection',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailer',
    'transfer-encoding',
    'upgrade',
    'content-encoding',
    'content-length',
]);

const proxy = async (
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> },
) => {
    const { path } = await context.params;
    const url = new URL(request.url);
    const target = `${BACKEND_BASE}/${path.join('/')}${url.search}`;

    const headers = new Headers();
    request.headers.forEach((value, key) => {
        if (!HOP_BY_HOP_REQUEST_HEADERS.has(key.toLowerCase())) {
            headers.set(key, value);
        }
    });

    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
    const body = hasBody ? await request.arrayBuffer() : undefined;

    let upstream: Response;
    try {
        upstream = await fetch(target, {
            method: request.method,
            headers,
            body,
            redirect: 'manual',
        });
    } catch (err) {
        return new Response(
            JSON.stringify({
                error: 'upstream_fetch_failed',
                message: (err as Error).message,
            }),
            { status: 502, headers: { 'content-type': 'application/json' } },
        );
    }

    const responseHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
        const lower = key.toLowerCase();
        // set-cookie обрабатываем отдельно через getSetCookie() — forEach
        // склеивает несколько кук в одну строку и ломает их.
        if (!HOP_BY_HOP_RESPONSE_HEADERS.has(lower) && lower !== 'set-cookie') {
            responseHeaders.append(key, value);
        }
    });

    // Куки бэкенда (XSRF-TOKEN, yuviron_csrf, refresh) должны сесть на НАШ
    // origin (dev.yuviron.com / localhost), а не на dev-api — иначе браузер
    // либо отбросит куку (Domain не совпадает с origin ответа), либо
    // document.cookie её не увидит. Убираем атрибут Domain → кука становится
    // host-only для домена страницы. Это и есть весь смысл same-origin прокси.
    for (const cookie of upstream.headers.getSetCookie()) {
        responseHeaders.append(
            'set-cookie',
            cookie.replace(/;\s*Domain=[^;]*/i, ''),
        );
    }

    return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
    });
};

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
export const HEAD = proxy;
