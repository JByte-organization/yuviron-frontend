import type { NextRequest } from "next/server";
import { getServerApiBaseUrl } from "@/lib/env";

const HOP_BY_HOP_HEADERS = [
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "host",
    "content-length",
];

export async function proxyToBackend(
    request: NextRequest,
    pathname: string,
): Promise<Response> {
    const baseUrl = getServerApiBaseUrl();
    const targetUrl = new URL(pathname, baseUrl);
    targetUrl.search = request.nextUrl.search;

    const headers = new Headers(request.headers);
    for (const header of HOP_BY_HOP_HEADERS) headers.delete(header);

    const init: RequestInit = {
        method: request.method,
        headers,
        redirect: "manual",
        cache: "no-store",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
        const body = await request.arrayBuffer();
        if (body.byteLength > 0) init.body = body;
    }

    const upstreamResponse = await fetch(targetUrl, init);

    const responseHeaders = new Headers(upstreamResponse.headers);
    for (const header of HOP_BY_HOP_HEADERS) responseHeaders.delete(header);

    return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders,
    });
}