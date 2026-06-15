'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { configureApiClient, initCsrfToken, postApiAuthRefresh } from '@repo/api/client.ts';
import { useSessionStore } from '@/entities/session/model/store';

export const ApiClientProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();

    useEffect(() => {
        configureApiClient({
            // Same-origin проксі (Route Handler /api-proxy/[...path]) — куки
            // бекенда стають first-party до нашого домену. Прямий виклик
            // dev-api.yuviron.com з браузера ламає CSRF: XSRF-TOKEN кука
            // третьостороння, document.cookie її не бачить → refresh 400 →
            // розлогін на кожному F5 і зламані мутації (PUT settings).
            baseUrl: '/api-proxy',
            getToken: () => useSessionStore.getState().accessToken,
            onUnauthorized: () => {
                // Очищаємо токен якщо він був — але не редіректимо
                // Редірект тільки якщо користувач був авторизований
                const wasAuthenticated = !!useSessionStore.getState().accessToken;
                useSessionStore.getState().clearSession();
                if (wasAuthenticated) {
                    router.replace('/login');
                }
            },
            onTokenRefresh: (token) => useSessionStore.getState().setAccessToken(token),
        });

        // Оптимістично піднімаємо стан до 'authenticated', якщо минулого разу
        // була сесія — щоб каркас (Header/Sidebar/Home) не блимав гостьовим
        // виглядом ту ~секунду, поки їде мережевий refresh. Реальний токен
        // підставиться нижче; якщо refresh провалиться — впадемо у гостя.
        useSessionStore.getState().hydrateFromHint();

        const restoreSession = async () => {
            try {
                // Получаем куку XSRF-TOKEN ДО refresh — иначе бэк вернёт 400.
                await initCsrfToken();
                const data = await postApiAuthRefresh();
                const refreshed = data as { accessToken?: string; token?: string };
                const token = refreshed?.accessToken ?? refreshed?.token;
                if (token) {
                    useSessionStore.getState().setAccessToken(token);
                } else {
                    // 200 без токена трактуємо як відсутність сесії.
                    useSessionStore.getState().markUnauthenticated();
                }
            } catch (error) {
                // Немає валідної refresh-куки (перший візит / сесія протухла) —
                // це нормальний шлях. Але БІЛЬШЕ не глушимо мовчки: саме тихий
                // catch ховав зламаний CSRF-refresh (розлогін на кожному F5).
                useSessionStore.getState().markUnauthenticated();
                console.warn('[auth] restore session failed:', error);
            } finally {
                // Сесію відновлено (успішно чи ні) — гейти можуть приймати рішення.
                useSessionStore.getState().markAuthResolved();
            }
        };

        restoreSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <>{children}</>;
};