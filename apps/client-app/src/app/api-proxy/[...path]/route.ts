// Ручной прокси на бэк. Заменяет Next.js rewrites потому что встроенный
// rewrite-прокси Next 16 не уважает NODE_TLS_REJECT_UNAUTHORIZED и падает
// на внутреннем CA dev-сертификата. Здесь fetch — это нативный undici,
// который env-флаг подхватывает корректно.

import { NextRequest } from 'next/server';

const BACKEND_BASE = 'https://dev-api.yuviron.com/api';

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
        if (!HOP_BY_HOP_RESPONSE_HEADERS.has(key.toLowerCase())) {
            responseHeaders.append(key, value);
        }
    });

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
