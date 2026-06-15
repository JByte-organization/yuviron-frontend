export interface ClientThemeDto {
    id?: string;
    name?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    backgroundColor?: string | null;
}

export const applyThemeGradients = (
    themeId: string | null | undefined,
    availableThemes: ClientThemeDto[] | null | undefined
) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // Якщо тема не налаштована або список тем порожній — повертаємо стандартний ембієнт плеєра
    if (!themeId || !availableThemes || availableThemes.length === 0) {
        root.style.removeProperty('--premium-primary');
        root.style.removeProperty('--premium-secondary');
        root.style.removeProperty('--premium-bg');
        root.removeAttribute('data-premium-theme');
        return;
    }

    // Шукаємо активну тему серед реальних моделей, створених в адмінці
    const activeTheme = availableThemes.find(t => t.id === themeId);

    if (activeTheme?.primaryColor && activeTheme?.secondaryColor && activeTheme?.backgroundColor) {
        root.style.setProperty('--premium-primary', activeTheme.primaryColor);
        root.style.setProperty('--premium-secondary', activeTheme.secondaryColor);
        root.style.setProperty('--premium-bg', activeTheme.backgroundColor);
        root.setAttribute('data-premium-theme', 'true');
    } else {
        root.style.removeProperty('--premium-primary');
        root.style.removeProperty('--premium-secondary');
        root.style.removeProperty('--premium-bg');
        root.removeAttribute('data-premium-theme');
    }
};