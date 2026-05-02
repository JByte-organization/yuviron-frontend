'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
    theme: 'dark',
    toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
    children: React.ReactNode;
    /** TODO: передати з useGetApiCurrentUser() — збережена тема юзера */
    initialTheme?: Theme;
    /** TODO: передати usePostApiUserTheme() — зберегти тему на бекенді */
    onThemeChange?: (theme: Theme) => void;
}

export const ThemeProvider = ({
                                  children,
                                  initialTheme,
                                  onThemeChange,
                              }: ThemeProviderProps) => {
    const [theme, setTheme] = useState<Theme>(() => {
        // Авторизований — використовуємо тему з бекенду
        if (initialTheme) return initialTheme;
        // Неавторизований — з localStorage
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('theme') as Theme) ?? 'dark';
        }
        return 'dark';
    });

    // Застосовуємо тему на <html>
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        const next: Theme = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        // Неавторизований — зберігаємо в localStorage
        localStorage.setItem('theme', next);
        // Авторизований — зберігаємо на бекенді
        onThemeChange?.(next);
        // TODO: usePostApiUserTheme({ theme: next })
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};