// Ручной прокси на бэк. Заменяет Next.js rewrites потому что встроенный
// rewrite-прокси Next 16 не уважает NODE_TLS_REJECT_UNAUTHORIZED и падает
// на внутреннем CA dev-сертификата. Здесь fetch — это нативный undici,
// который env-флаг подхватывает корректно.

import { NextRequest } from 'next/server';

// Кандидаты upstream-а, по приоритету:
// 1. BACKEND_URL — явная настройка окружения (прод обязан задать её сам).
// 2. https://dev-api.yuviron.com/api — локальная разработка: имя резолвится
//    через Tailscale split-DNS / hosts-файл разработчика.
// 3. http://backend:5073/api — задеплоенный контейнер: dev-api.yuviron.com
//    НЕ существует в публичном DNS (только в tailnet), поэтому изнутри
//    docker-сети ходим напрямую в сервис `backend` (он слушает HTTP на 5073 —
//    см. healthcheck/wget в deploy.yml). Это чинило 502 upstream_fetch_failed
//    на dev.yuviron.com.
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



// Первый кандидат, который реально ответил — кешируем, чтобы не дёргать
// мёртвые базы на каждый запрос. Сбрасывается только рестартом процесса.
let activeBase: string | null = null;

// dev-api отдаёт сертификат внутреннего CA, которого нет в bundled-списке Node.
// Локально это решает cross-env NODE_TLS_REJECT_UNAUTHORIZED=0 в dev-скрипте,
// но в задеплоенном контейнере env не выставлен — без этого хака прокси падал бы
// в 502 на TLS. Включаем ТОЛЬКО для dev-бэкенда: прод обязан задать BACKEND_URL
// с публично доверенным сертификатом, и валидация останется включённой.
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

    // Бэкенд (ASP.NET, AntiforgeryOptions.Cookie.SecurePolicy = Always) отдаёт
    // 400 «request is not an SSL request» на любой не-HTTPS запрос — а фолбек
    // http://backend:5073 как раз голый HTTP внутри docker-сети. Поэтому явно
    // говорим беку, что ИСХОДНЫЙ запрос пришёл по HTTPS: берём X-Forwarded-Proto,
    // который выставил nginx (мы его срезали выше как hop-by-hop), либо протокол
    // текущего запроса. Чтобы это сработало, бек должен доверять прокси
    // (ForwardedHeaders middleware) — см. сообщение девопсам в тикете.
    const forwardedProto =
        request.headers.get('x-forwarded-proto') ?? url.protocol.replace(':', '');
    const forwardedHost =
        request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? url.host;
    headers.set('x-forwarded-proto', forwardedProto);
    headers.set('x-forwarded-host', forwardedHost);

    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
    // Тело буферизуем (не стримим) — оно нужно повторно при фолбеке на
    // следующего кандидата upstream-а.
    const body = hasBody ? await request.arrayBuffer() : undefined;

    // Рабочую базу пробуем первой, остальные — фолбек на сетевую ошибку
    // (HTTP-статусы вроде 4xx/5xx — это ОТВЕТ бэка, их не ретраим).
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
