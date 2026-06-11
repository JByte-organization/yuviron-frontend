import { defineConfig } from '@playwright/test';

// E2E для кабінету артиста. Тести мокають мережу (route interception у
// e2e/support/studioMock.ts), тож не залежать від живого бекенда чи реального
// логіна. Мобільні перевірки роблять через per-test viewport (390px), а не через
// окремий device-проєкт — так viewport контролює сам тест і він детермінований.
const PORT = Number(process.env.E2E_PORT ?? 3000);
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
    testDir: './e2e',
    timeout: 30_000,
    expect: { timeout: 7_000 },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: [['list']],
    use: {
        baseURL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
    webServer: {
        // Уже запущений dev-сервер перевикористовуємо; інакше Playwright підніме свій.
        command: 'pnpm --filter client-app dev',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
    },
});
