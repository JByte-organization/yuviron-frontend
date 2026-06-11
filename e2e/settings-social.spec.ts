import { test, expect } from '@playwright/test';
import { mockStudio } from './support/studioMock';

test.describe('Artist settings — social links', () => {
    test.beforeEach(async ({ page }) => {
        await mockStudio(page);
    });

    test('renders the social block and adds a row with PascalCase platforms', async ({ page }) => {
        await page.goto('/artist-dashboard/settings');

        // Блок соцмереж видно (профіль + canManage=Owner з моку).
        await expect(page.getByText('Соцмережі')).toBeVisible();

        const selects = page.locator('select.client-modal__input');
        const before = await selects.count();

        await page.getByRole('button', { name: 'Додати посилання' }).click();
        await expect(selects).toHaveCount(before + 1);

        // Опції — значення enum SocialLinkType (PascalCase). Нижній регістр валив 500.
        const lastSelect = selects.last();
        await expect(lastSelect.locator('option', { hasText: 'Spotify' })).toHaveValue('Spotify');
        await expect(lastSelect.locator('option', { hasText: 'YouTube' })).toHaveValue('YouTube');
    });

    test('mobile: settings page has no horizontal overflow', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto('/artist-dashboard/settings');
        await expect(page.getByText('Соцмережі')).toBeVisible();

        const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(2);
    });
});
