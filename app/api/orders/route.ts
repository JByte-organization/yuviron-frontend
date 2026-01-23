import type { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/proxyToBackend";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    return proxyToBackend(request, "/orders");
}

export async function POST(request: NextRequest) {
    return proxyToBackend(request, "/orders");
}