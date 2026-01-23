import { NextResponse } from "next/server";
import { getAppEnv, getServerApiBaseUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export function GET() {
    return NextResponse.json({
        appEnv: getAppEnv(),
        apiBaseUrl: getServerApiBaseUrl(),
        nodeEnv: process.env.NODE_ENV ?? null,
        timestamp: new Date().toISOString(),
    });
}