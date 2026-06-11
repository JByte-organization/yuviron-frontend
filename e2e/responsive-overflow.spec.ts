import { test, expect } from '@playwright/test';
import { mockStudio, STUDIO_PATHS } from './support/studioMock';

// Жодна сторінка кабінету не має давати горизонтальний скрол на телефоні (390px).
// Це найгрубіший, але найнадійніший сигнал зламаної мобільної вёрстки.
test.describe('Studio pages — no horizontal overflow @ 390px', () => {
    test.beforeEach(async ({ page }) => {
        await mockStudio(page);
        await page.setViewportSize({ width: 390, height: 844 });
    });

    for (const path of STUDIO_PATHS) {
        test(`no overflow: ${path}`, async ({ page }) => {
            await page.goto(path);
            // Дати контенту змонтуватись (мобільна навігація є на всіх сторінках студії).
            await expect(page.locator('.artist-mobile-nav')).toBeVisible();

            const overflow = await page.evaluate(
                () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
            );
            expect(overflow, `${path} overflows by ${overflow}px`).toBeLessThanOrEqual(2);
        });
    }
});
