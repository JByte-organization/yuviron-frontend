import { test, expect } from '@playwright/test';
import { mockStudio } from './support/studioMock';

const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 800 };

test.describe('Artist studio navigation', () => {
    test.beforeEach(async ({ page }) => {
        await mockStudio(page);
    });

    test('mobile: shows the mobile tab-bar, hides the sidebar, and navigates', async ({ page }) => {
        await page.setViewportSize(MOBILE);
        await page.goto('/artist-dashboard');

        const mobileNav = page.locator('.artist-mobile-nav');
        await expect(mobileNav).toBeVisible();

        // Сайдбар прихований нижче lg (display:none) — головна причина, чому раніше
        // по студії на телефоні неможливо було переміщатись.
        await expect(page.locator('.client-sidebar')).toBeHidden();

        // Клік по пілюлі "Треки" має перейти на сторінку треків.
        await mobileNav.getByRole('link', { name: 'Треки' }).click();
        await expect(page).toHaveURL(/\/artist-dashboard\/tracks$/);
        await expect(mobileNav.getByRole('link', { name: 'Треки' })).toHaveAttribute('aria-current', 'page');
    });

    test('desktop: shows the sidebar, hides the mobile tab-bar', async ({ page }) => {
        await page.setViewportSize(DESKTOP);
        await page.goto('/artist-dashboard');

        await expect(page.locator('.client-sidebar')).toBeVisible();
        await expect(page.locator('.artist-mobile-nav')).toBeHidden();
    });
});
