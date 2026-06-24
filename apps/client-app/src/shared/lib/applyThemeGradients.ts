export interface ClientThemeDto {
    id?: string;
    name?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    backgroundColor?: string | null;
}

// 🚨 ФІКС: Повертаємо сигнатуру на два обов'язкові аргументи для TanStack-потоку
export const applyThemeGradients = (
    themeId: string | null | undefined,
    availableThemes: ClientThemeDto[] | null | undefined
) => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // Якщо тема не обрана або список пресетів з бекенду ще не завантажився — скидаємо в дефолт
    if (!themeId || !availableThemes || availableThemes.length === 0) {
        root.style.removeProperty('--premium-primary');
        root.style.removeProperty('--premium-secondary');
        root.style.removeProperty('--premium-bg');
        root.removeAttribute('data-premium-theme');
        return;
    }

    // Шукаємо активну тему в реальному масиві, що прийшов зі Сваггер-роуту
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