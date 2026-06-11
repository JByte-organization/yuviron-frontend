import type { Page, Route } from '@playwright/test';

// ── Моки кабінету артиста ──────────────────────────────────────────────
// Бут-флоу застосунку: initCsrfToken → postApiAuthRefresh (віддає accessToken)
// → /auth/me (CurrentUserDto з managedArtists) → студія резолвить artistId.
// Мутатор (@repo/api) ходить через same-origin проксі '/api-proxy' і ріже '/api'
// з шляху, тож реальні запити мають вигляд /api-proxy/auth/refresh,
// /api-proxy/studio-artist/profile/{id} тощо. Перехоплюємо їх і віддаємо фікстури —
// тести не залежать від живого бекенда чи реального логіна.

export const ARTIST_ID = '392dc274-a09f-4418-808c-6dc31e587667';
export const USER_ID = '11111111-1111-1111-1111-111111111111';

const b64url = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString('base64url');

// JWT, який застосунок лише ДЕКОДУЄ (підпис не перевіряє). exp — далеко в майбутньому.
const fakeJwt = (claims: Record<string, unknown>) =>
    `${b64url({ alg: 'none', typ: 'JWT' })}.${b64url({ exp: 4102444800, ...claims })}.sig`;

const studioProfile = {
    id: ARTIST_ID,
    name: 'Test Artist',
    verificationStatus: 'Verified',
    isPremium: true,
    details: { bio: 'Bio тексту', avatarUrl: null, bannerUrl: null, createdAt: '2020-01-01T00:00:00Z' },
    stats: { totalPlays: 12345, monthlyListenersCount: 678 },
    finance: {
        availableBalance: 100, heldBalance: 0, totalEarned: 100,
        payoutSettings: { method: 'PayPal', accountDetails: 'a@b.c', minWithdrawAmount: 10, platformPercent: 15 },
    },
    team: [],
    socialLinks: [{ type: 'Instagram', url: 'https://instagram.com/test' }],
};

const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

const emptyList = { items: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0, hasNextPage: false, hasPreviousPage: false };

/**
 * Налаштовує перехоплення мережі так, щоб застосунок вважав користувача залогіненим
 * власником артиста ARTIST_ID. Викликати ДО page.goto().
 *
 * Порядок реєстрації важливий: Playwright бере НАЙОСТАННІШЕ зареєстрований
 * відповідний маршрут, тож спершу — широкий catch-all, потім — конкретні.
 */
export async function mockStudio(page: Page) {
    // catch-all для будь-яких studio-artist ендпоінтів → порожній список/обʼєкт.
    await page.route('**/api-proxy/studio-artist/**', (r) => json(r, emptyList));

    await page.route('**/api-proxy/auth/csrf-token**', (r) =>
        r.fulfill({ status: 200, headers: { 'set-cookie': 'XSRF-TOKEN=test-csrf; Path=/' }, body: '' }),
    );
    await page.route('**/api-proxy/auth/refresh**', (r) =>
        json(r, { accessToken: fakeJwt({ sub: USER_ID, role: 'ManagementUser', email: 'artist@test.dev' }) }),
    );
    await page.route('**/api-proxy/auth/me**', (r) =>
        json(r, {
            id: USER_ID, email: 'artist@test.dev', isPremium: true,
            profile: { firstName: 'Test', avatarUrl: null, bannerUrl: null },
            settings: {},
            managedArtists: [{ artistId: ARTIST_ID, name: 'Test Artist', avatarUrl: null, role: 'Owner' }],
        }),
    );
    await page.route('**/api-proxy/notifications/unread-count**', (r) => json(r, 0));
    await page.route('**/api-proxy/notifications**', (r) => json(r, emptyList));

    // Профіль артиста (конкретний — реєструємо ПІСЛЯ catch-all, щоб виграв).
    await page.route(`**/api-proxy/studio-artist/profile/${ARTIST_ID}**`, (r) => json(r, studioProfile));
    await page.route('**/api-proxy/studio-artist/stats**', (r) =>
        json(r, { totalPlays: 12345, monthlyListeners: 678, totalAlbums: 2, totalTracks: 9, topTrack: null }),
    );
    await page.route('**/api-proxy/studio-artist/finance/wallet**', (r) =>
        json(r, { artistId: ARTIST_ID, availableBalance: 100, heldBalance: 0, totalEarned: 100, updatedAt: '2024-01-01T00:00:00Z' }),
    );
}

export const STUDIO_PATHS = [
    '/artist-dashboard',
    '/artist-dashboard/tracks',
    '/artist-dashboard/albums',
    '/artist-dashboard/team',
    '/artist-dashboard/analytics',
    '/artist-dashboard/finance',
    '/artist-dashboard/settings',
];
