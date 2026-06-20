
import { NextRequest } from 'next/server';

// const CANDIDATE_BASES = [
//     process.env.BACKEND_URL,
//     'https://dev-api.yuviron.com/api',
//     'http://backend:5073/api',
// ].filter((base): base is string => !!base);


const CANDIDATE_BASES = [
    process.env.BACKEND_URL,
    process.env.NEXT_PUBLIC_API_URL,
    'https://dev-api.yuviron.com/api',
    'http://backend:5073/api',
].filter((base): base is string => !!base)
    .map(base => base.endsWith('/') ? base.slice(0, -1) : base);



let activeBase: string | null = null;

if (
    !process.env.BACKEND_URL &&
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

    const headers = new Headers();
    request.headers.forEach((value, key) => {
        if (!HOP_BY_HOP_REQUEST_HEADERS.has(key.toLowerCase())) {
            headers.set(key, value);
        }
    });

    const forwardedProto =
        request.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '');
    const forwardedHost =
        request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? url.host;
    headers.set('x-forwarded-proto', forwardedProto);
    headers.set('x-forwarded-host', forwardedHost);

    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
    const body = hasBody ? await request.arrayBuffer() : undefined;

    const bases = activeBase
        ? [activeBase, ...CANDIDATE_BASES.filter((b) => b !== activeBase)]
        : CANDIDATE_BASES;

    let upstream: Response | null = null;
    let lastError: Error | null = null;

    for (const base of bases) {
        const target = `${base}/${path.join('/')}${url.search}`;
        try {
            upstream = await fetch(target, {
                method: request.method,
                headers,
                body,
                redirect: 'manual',
            });
            activeBase = base;
            break;
        } catch (err) {
            lastError = err as Error;
            console.error(
                `[api-proxy] upstream fetch failed for ${base}: ${(err as Error).message}`,
            );
        }
    }

    if (!upstream) {
        return new Response(
            JSON.stringify({
                error: 'upstream_fetch_failed',
                message: lastError?.message ?? 'all upstream candidates failed',
            }),
            { status: 502, headers: { 'content-type': 'application/json' } },
        );
    }

    const responseHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
        const lower = key.toLowerCase();
        if (!HOP_BY_HOP_RESPONSE_HEADERS.has(lower) && lower !== 'set-cookie') {
            responseHeaders.append(key, value);
        }
    });

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
