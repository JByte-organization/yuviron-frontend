"use client";

import { useEffect, useMemo, useState } from "react";

type ApiResult = {
    loading: boolean;
    ok?: boolean;
    status?: number;
    durationMs?: number;
    data?: unknown;
    error?: string;
};

type MetaResponse = {
    appEnv: "dev" | "prod";
    apiBaseUrl: string;
    nodeEnv: string | null;
    timestamp: string;
};

function parseMaybeJson(text: string): unknown {
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

function formatJson(value: unknown): string {
    if (typeof value === "string") return value;
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

function ResultBox({ result }: { result: ApiResult | undefined }) {
    const tone = !result
        ? "border-zinc-200/70 dark:border-zinc-800"
        : result.loading
            ? "border-blue-300/70 dark:border-blue-700"
            : result.ok
                ? "border-emerald-300/70 dark:border-emerald-700"
                : "border-rose-300/70 dark:border-rose-700";

    return (
        <div
            className={[
                "min-h-[120px] rounded-xl border bg-white/70 p-4 backdrop-blur dark:bg-zinc-950/40",
                tone,
            ].join(" ")}
        >
            {!result ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Нажми кнопку, чтобы увидеть ответ.
                </p>
            ) : result.loading ? (
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                    Запрос выполняется…
                </p>
            ) : result.error ? (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                        Ошибка
                    </p>
                    <pre className="whitespace-pre-wrap break-words text-xs text-rose-800 dark:text-rose-200">
                        {result.error}
                    </pre>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                        <span
                            className={[
                                "inline-flex items-center rounded-md px-2 py-1 font-medium",
                                result.ok
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
                                    : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200",
                            ].join(" ")}
                        >
                            {result.status}
                        </span>
                        {typeof result.durationMs === "number" ? (
                            <span className="rounded-md bg-zinc-100 px-2 py-1 dark:bg-zinc-900">
                                {result.durationMs} ms
                            </span>
                        ) : null}
                    </div>
                    <pre className="max-h-[260px] overflow-auto whitespace-pre-wrap break-words text-xs text-zinc-900 dark:text-zinc-50">
                        {formatJson(result.data)}
                    </pre>
                </div>
            )}
        </div>
    );
}

export default function Home() {
    const [meta, setMeta] = useState<MetaResponse | null>(null);
    const [metaError, setMetaError] = useState<string | null>(null);
    const [results, setResults] = useState<Record<string, ApiResult>>({});

    const [userId, setUserId] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    const [orderId, setOrderId] = useState("");
    const [productName, setProductName] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [price, setPrice] = useState("0");
    const [description, setDescription] = useState("");

    const run = async (key: string, input: { url: string; init?: RequestInit }) => {
        setResults((prev) => ({ ...prev, [key]: { loading: true } }));

        const started = performance.now();
        try {
            const response = await fetch(input.url, {
                cache: "no-store",
                redirect: "follow",
                ...input.init,
            });

            const durationMs = Math.round(performance.now() - started);
            const contentType = response.headers.get("content-type") ?? "";

            let data: unknown;
            if (contentType.includes("application/json")) data = await response.json();
            else data = parseMaybeJson(await response.text());

            setResults((prev) => ({
                ...prev,
                [key]: {
                    loading: false,
                    ok: response.ok,
                    status: response.status,
                    durationMs,
                    data,
                },
            }));
        } catch (error) {
            setResults((prev) => ({
                ...prev,
                [key]: {
                    loading: false,
                    error: error instanceof Error ? error.message : String(error),
                },
            }));
        }
    };

    useEffect(() => {
        const load = async () => {
            try {
                const response = await fetch("/api/meta", { cache: "no-store" });
                if (!response.ok) {
                    setMetaError(`GET /api/meta failed: ${response.status}`);
                    return;
                }
                const data = (await response.json()) as MetaResponse;
                setMeta(data);
            } catch (error) {
                setMetaError(error instanceof Error ? error.message : String(error));
            }
        };

        void load();
    }, []);

    const primaryButton =
        "inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white";
    const secondaryButton =
        "inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900";
    const inputClass =
        "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-600 dark:focus:ring-zinc-800";

    const metaBadge = useMemo(() => {
        if (!meta) return null;
        return meta.appEnv === "prod"
            ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200"
            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200";
    }, [meta]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-200 font-sans text-zinc-900 dark:from-zinc-950 dark:to-zinc-900 dark:text-zinc-50">
            <div className="mx-auto max-w-6xl px-6 py-10">
                <header className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Yuviron API Playground
                        </h1>
                        {meta ? (
                            <span
                                className={[
                                    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
                                    metaBadge ?? "",
                                ].join(" ")}
                            >
                                {meta.appEnv.toUpperCase()}
                                <span className="opacity-70">({meta.nodeEnv ?? "—"})</span>
                            </span>
                        ) : null}
                    </div>

                    <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-300">
                        Кнопки ниже вызывают <span className="font-mono">/api/*</span> на
                        текущем домене. Дальше Next.js на сервере проксирует запрос в нужный
                        бэкенд (dev/prod) по переменным окружения.
                    </p>

                    <div className="rounded-xl border border-zinc-200/70 bg-white/70 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Текущее подключение</p>
                                {meta ? (
                                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                                        <span className="font-mono">{meta.apiBaseUrl}</span>
                                    </p>
                                ) : metaError ? (
                                    <p className="text-xs text-rose-700 dark:text-rose-300">
                                        {metaError}
                                    </p>
                                ) : (
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                        Загружаю…
                                    </p>
                                )}
                            </div>
                            <button
                                className={secondaryButton}
                                onClick={() => void run("meta", { url: "/api/meta" })}
                            >
                                Проверить /api/meta
                            </button>
                        </div>
                        <div className="mt-3">
                            <ResultBox result={results["meta"]} />
                        </div>
                    </div>
                </header>

                <main className="mt-10 grid gap-6 lg:grid-cols-2">
                    <section className="space-y-4">
                        <div className="flex items-baseline justify-between">
                            <h2 className="text-lg font-semibold">Users</h2>
                            <span className="text-xs text-zinc-600 dark:text-zinc-300">
                                /users
                            </span>
                        </div>

                        <div className="rounded-xl border border-zinc-200/70 bg-white/70 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium">Get list</p>
                                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                                        GET <span className="font-mono">/api/users/getList</span>
                                    </p>
                                </div>
                                <button
                                    className={primaryButton}
                                    onClick={() =>
                                        void run("users.getList", { url: "/api/users/getList" })
                                    }
                                >
                                    Выполнить
                                </button>
                            </div>
                            <div className="mt-3">
                                <ResultBox result={results["users.getList"]} />
                            </div>
                        </div>

                        <div className="rounded-xl border border-zinc-200/70 bg-white/70 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div className="flex-1 space-y-2">
                                    <p className="text-sm font-medium">Get by id</p>
                                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                                        GET <span className="font-mono">/api/users/:id</span>
                                    </p>
                                    <input
                                        className={inputClass}
                                        value={userId}
                                        onChange={(e) => setUserId(e.target.value)}
                                        placeholder="User id"
                                    />
                                </div>
                                <button
                                    className={primaryButton}
                                    disabled={!userId.trim()}
                                    onClick={() =>
                                        void run("users.getById", {
                                            url: `/api/users/${encodeURIComponent(userId.trim())}`,
                                        })
                                    }
                                >
                                    Выполнить
                                </button>
                            </div>
                            <div className="mt-3">
                                <ResultBox result={results["users.getById"]} />
                            </div>
                        </div>

                        <div className="rounded-xl border border-zinc-200/70 bg-white/70 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div className="flex-1 space-y-2">
                                    <p className="text-sm font-medium">Create user</p>
                                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                                        POST <span className="font-mono">/api/users</span>
                                    </p>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        <input
                                            className={inputClass}
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="First name"
                                        />
                                        <input
                                            className={inputClass}
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Last name"
                                        />
                                    </div>
                                </div>
                                <button
                                    className={primaryButton}
                                    disabled={!firstName.trim() || !lastName.trim()}
                                    onClick={() =>
                                        void run("users.create", {
                                            url: "/api/users",
                                            init: {
                                                method: "POST",
                                                headers: { "content-type": "application/json" },
                                                body: JSON.stringify({
                                                    firstName: firstName.trim(),
                                                    lastName: lastName.trim(),
                                                }),
                                            },
                                        })
                                    }
                                >
                                    Создать
                                </button>
                            </div>
                            <div className="mt-3">
                                <ResultBox result={results["users.create"]} />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-baseline justify-between">
                            <h2 className="text-lg font-semibold">Orders</h2>
                            <span className="text-xs text-zinc-600 dark:text-zinc-300">
                                /orders
                            </span>
                        </div>

                        <div className="rounded-xl border border-zinc-200/70 bg-white/70 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium">Get list</p>
                                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                                        GET <span className="font-mono">/api/orders</span>
                                    </p>
                                </div>
                                <button
                                    className={primaryButton}
                                    onClick={() => void run("orders.getList", { url: "/api/orders" })}
                                >
                                    Выполнить
                                </button>
                            </div>
                            <div className="mt-3">
                                <ResultBox result={results["orders.getList"]} />
                            </div>
                        </div>

                        <div className="rounded-xl border border-zinc-200/70 bg-white/70 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40">
                            <div className="flex flex-wrap items-end justify-between gap-3">
                                <div className="flex-1 space-y-2">
                                    <p className="text-sm font-medium">Get by id</p>
                                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                                        GET <span className="font-mono">/api/orders/:id</span>
                                    </p>
                                    <input
                                        className={inputClass}
                                        value={orderId}
                                        onChange={(e) => setOrderId(e.target.value)}
                                        placeholder="Order id"
                                    />
                                </div>
                                <button
                                    className={primaryButton}
                                    disabled={!orderId.trim()}
                                    onClick={() =>
                                        void run("orders.getById", {
                                            url: `/api/orders/${encodeURIComponent(orderId.trim())}`,
                                        })
                                    }
                                >
                                    Выполнить
                                </button>
                            </div>
                            <div className="mt-3">
                                <ResultBox result={results["orders.getById"]} />
                            </div>
                        </div>

                        <div className="rounded-xl border border-zinc-200/70 bg-white/70 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40">
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-end justify-between gap-3">
                                    <div className="flex-1 space-y-2">
                                        <p className="text-sm font-medium">Create order</p>
                                        <p className="text-xs text-zinc-600 dark:text-zinc-300">
                                            POST <span className="font-mono">/api/orders</span>
                                        </p>
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <input
                                                className={inputClass}
                                                value={productName}
                                                onChange={(e) => setProductName(e.target.value)}
                                                placeholder="Product name"
                                            />
                                            <input
                                                className={inputClass}
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Description"
                                            />
                                            <input
                                                className={inputClass}
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                inputMode="numeric"
                                                placeholder="Quantity"
                                            />
                                            <input
                                                className={inputClass}
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                inputMode="decimal"
                                                placeholder="Price"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        className={primaryButton}
                                        disabled={!productName.trim()}
                                        onClick={() => {
                                            const quantityNumber = Number(quantity);
                                            const priceNumber = Number(price);
                                            void run("orders.create", {
                                                url: "/api/orders",
                                                init: {
                                                    method: "POST",
                                                    headers: { "content-type": "application/json" },
                                                    body: JSON.stringify({
                                                        productName: productName.trim(),
                                                        quantity: Number.isFinite(quantityNumber)
                                                            ? quantityNumber
                                                            : quantity,
                                                        price: Number.isFinite(priceNumber) ? priceNumber : price,
                                                        description: description.trim(),
                                                    }),
                                                },
                                            });
                                        }}
                                    >
                                        Создать
                                    </button>
                                </div>

                                <ResultBox result={results["orders.create"]} />
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="mt-10 text-xs text-zinc-600 dark:text-zinc-400">
                    <p>
                        Если открываешь в адресной строке{" "}
                        <span className="font-mono">/users/getList</span> и видишь 404 — это
                        не бэкенд, а Next-роут. Используй{" "}
                        <span className="font-mono">/api/users/getList</span> или кнопки выше
                        (добавлен rewrite, чтобы{" "}
                        <span className="font-mono">/users/getList</span> тоже работал).
                    </p>
                    <p className="mt-2 font-mono">
                        &copy; {new Date().getFullYear()} JByte-organization
                    </p>
                </footer>
            </div>
        </div>
    );
}
