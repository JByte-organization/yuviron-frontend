export type AppEnv = "dev" | "prod";

function normalizeAppEnv(value: string | undefined): AppEnv | undefined {
    if (!value) return undefined;

    const normalized = value.trim().toLowerCase();
    if (normalized === "dev" || normalized === "development") return "dev";
    if (normalized === "prod" || normalized === "production") return "prod";

    return undefined;
}

function normalizeBaseUrl(url: string): string {
    const trimmed = url.trim().replace(/\/+$/, "");

    try {
        new URL(trimmed);
    } catch {
        throw new Error(`Invalid API base URL: "${url}"`);
    }

    return trimmed;
}

export function getAppEnv(): AppEnv {
    return (
        normalizeAppEnv(process.env.APP_ENV) ??
        normalizeAppEnv(process.env.NEXT_PUBLIC_APP_ENV) ??
        (process.env.NODE_ENV === "production" ? "prod" : "dev")
    );
}

export function getServerApiBaseUrl(): string {
    const explicit = process.env.API_BASE_URL;
    if (explicit) return normalizeBaseUrl(explicit);

    const appEnv = getAppEnv();
    const dev = process.env.API_BASE_URL_DEV;
    const prod = process.env.API_BASE_URL_PROD;

    if (!dev || !prod) {
        throw new Error(
            "Missing API base URL env vars. Set API_BASE_URL or (API_BASE_URL_DEV and API_BASE_URL_PROD).",
        );
    }

    return normalizeBaseUrl(appEnv === "prod" ? prod : dev);
}

export function getPublicApiBaseUrl(): string {
    const explicit = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (explicit) return normalizeBaseUrl(explicit);

    const appEnv = getAppEnv();
    const dev = process.env.NEXT_PUBLIC_API_BASE_URL_DEV;
    const prod = process.env.NEXT_PUBLIC_API_BASE_URL_PROD;

    if (!dev || !prod) {
        throw new Error(
            "Missing public API base URL env vars. Set NEXT_PUBLIC_API_BASE_URL or (NEXT_PUBLIC_API_BASE_URL_DEV and NEXT_PUBLIC_API_BASE_URL_PROD).",
        );
    }

    return normalizeBaseUrl(appEnv === "prod" ? prod : dev);
}