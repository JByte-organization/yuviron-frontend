'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    useGetApiMeSettingsPreferences,
    usePutApiMeSettingsTheme,
    getGetApiMeSettingsPreferencesQueryKey,
    type UserSettingsDto,
    type ThemeMode
} from '@repo/api/client';

import {
    useGetApiMeAppearanceThemes,
    usePutApiMeAppearanceThemesIdActivate,
    useGetApiMeAppearanceCustomTheme,
    usePutApiMeAppearanceCustomTheme,
    getGetApiMeAppearanceCustomThemeQueryKey,
    type ThemeDto,
    type CustomThemeDto
} from '@repo/api/client';

// Набір стильних базових пресетів для генерації градієнта преміум-користувача
const ACCENT_PRESETS = [
    { name: 'Classic Blue', hex: '#213a80', rgb: '33, 58, 128' },
    { name: 'Neon Purple', hex: '#631e82', rgb: '99, 30, 130' },
    { name: 'Crimson Wine', hex: '#821e3a', rgb: '130, 30, 58' },
    { name: 'Deep Amber', hex: '#82581e', rgb: '130, 88, 30' },
    { name: 'Cyberpunk Teal', hex: '#1e8270', rgb: '30, 130, 112' }
];

export const AppearanceSettingsSection = () => {
    const queryClient = useQueryClient();

    // Тимчасовий стейт-перемикач для зручності тестування (Зміни на false, щоб побачити як красиво блокується інтерфейс)
    const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);

    // ─── Запити даних з сервера ───────────────────────────
    const { data: prefsRaw } = useGetApiMeSettingsPreferences();
    const prefs = (prefsRaw as { data?: UserSettingsDto })?.data ?? (prefsRaw as UserSettingsDto);

    const { data: themesRaw } = useGetApiMeAppearanceThemes();
    const themes = themesRaw && Array.isArray(themesRaw.data) ? themesRaw.data : [];

    const { data: customThemeRaw } = useGetApiMeAppearanceCustomTheme({
        query: {
            queryKey: getGetApiMeAppearanceCustomThemeQueryKey(),
            enabled: isPremiumUser
        }
    });
    const customTheme = (customThemeRaw as { data?: CustomThemeDto })?.data ?? (customThemeRaw as CustomThemeDto);

    // ─── Мутації ──────────────────────────────────────────
    const { mutateAsync: updateBaseTheme } = usePutApiMeSettingsTheme();
    const { mutateAsync: activateThemePreset } = usePutApiMeAppearanceThemesIdActivate();
    const { mutateAsync: updateCustomTheme } = usePutApiMeAppearanceCustomTheme();

    // ─── Обробка подій ────────────────────────────────────
    const handleModeChange = async (mode: ThemeMode) => {
        try {
            await updateBaseTheme({ data: { themeMode: mode } });
            queryClient.invalidateQueries({ queryKey: getGetApiMeSettingsPreferencesQueryKey() });
        } catch (err) {
            console.error(err);
        }
    };

    const handleThemeActivate = async (themeId: string, isPremiumOnly?: boolean) => {
        if (isPremiumOnly && !isPremiumUser) return;
        try {
            await activateThemePreset({ id: themeId });
            queryClient.invalidateQueries({ queryKey: getGetApiMeSettingsPreferencesQueryKey() });
        } catch (err) {
            console.error(err);
        }
    };

    const handleCustomAccentSelect = async (rgbValue: string) => {
        try {
            // Зберігаємо обраний колір у конфіг персональної палітри користувача
            await updateCustomTheme({
                data: {
                    primaryColor: rgbValue, // Зберігаємо як RGB-рядок для динамічного підставлення у градієнт
                    secondaryColor: '15, 76, 71',
                    backgroundColor: '11, 11, 14'
                }
            });
            queryClient.invalidateQueries({ queryKey: getGetApiMeAppearanceCustomThemeQueryKey() });
        } catch (err) {
            console.error(err);
        }
    };

    // Визначаємо поточний активний колір для прев'ю градієнта
    const activeAccentRgb = customTheme?.primaryColor || '33, 58, 128';

    // Формуємо динамічний стиль фону на основі твоїх radial-gradient формул
    const gradientBackgroundStyle = {
        backgroundImage: `
            radial-gradient(circle at 50% 40%, rgba(${activeAccentRgb}, 0.38) 0%, transparent 55%),
            radial-gradient(circle at 85% 20%, rgba(15, 76, 71, 0.35) 0%, transparent 45%),
            radial-gradient(circle at 15% 15%, rgba(14, 52, 70, 0.35) 0%, transparent 45%),
            radial-gradient(circle at 85% 85%, rgba(20, 45, 80, 0.25) 0%, transparent 50%)
        `
    };

    return (
        <div className="yuviron-settings-appearance">

            {/* ТЕСТ-ПАНЕЛЬ ДЛЯ РОЗРОБНИКА (ВИДАЛИТИ ПЕРЕД ПРОДОМ) */}
            <div className="dev-premium-toggle mb-4 d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: '#141419', border: '1px dashed #333' }}>
                <span className="small text-secondary font-monospace">DEBUG: Toggle current premium subscription state</span>
                <button
                    className={`btn btn-xs fw-bold ${isPremiumUser ? 'btn-warning text-dark' : 'btn-outline-secondary text-white'}`}
                    onClick={() => setIsPremiumUser(!isPremiumUser)}
                >
                    {isPremiumUser ? '👑 PREMIUM MODE' : '❌ FREE MODE'}
                </button>
            </div>

            {/* БЛОК 1: ТИП ТЕМИ */}
            <div className="appearance-card">
                <div className="card-info-layout">
                    <div>
                        <span className="card-label">Interface Theme</span>
                        <p className="card-description">Synchronize layout configurations globally across systems.</p>
                    </div>
                    <div className="aesthetic-segmented">
                        {(['System', 'Dark', 'White'] as ThemeMode[]).map((mode) => {
                            const isSelected = prefs?.themeMode === mode;
                            return (
                                <button
                                    key={mode}
                                    type="button"
                                    className={`segmented-btn ${isSelected ? 'active-mode-bold' : ''}`}
                                    onClick={() => handleModeChange(mode)}
                                >
                                    {mode}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* БЛОК 2: ГОТОВІ КАТАЛОЖНІ ПРЕСЕТИ */}
            <div className="appearance-card mt-4">
                <span className="card-label mb-3 d-block">Color Presets</span>
                <div className="catalog-theme-grid">
                    {themes.map((t: ThemeDto) => {
                        if (!t.id) return null;
                        const isSelected = prefs?.themeId === t.id;

                        return (
                            <div
                                className={`preset-circle-card ${isSelected ? 'selected-preset' : ''}`}
                                key={t.id}
                                onClick={() => handleThemeActivate(t.id!, t.isPremiumOnly)}
                            >
                                <div className="triple-dot-preview" style={{ backgroundColor: t.backgroundColor || '#141419' }}>
                                    <span className="dot-node" style={{ backgroundColor: t.primaryColor || '#FFF' }} />
                                    <span className="dot-node" style={{ backgroundColor: t.secondaryColor || '#888' }} />
                                </div>
                                <span className="preset-name text-truncate">{t.name}</span>
                                {t.isPremiumOnly && <span className="premium-lock-badge">Premium</span>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* БЛОК 3: ПРЕМІУМ ГРАДІЄНТИ */}
            <div className="appearance-card mt-4 position-relative overflow-hidden">
                <span className="card-label mb-1 d-block">Ambient Universe Customization</span>
                <p className="card-description mb-4">Pick an accent color node to re-generate the dynamic layout background glow mapping.</p>

                <div className="premium-generator-layout">
                    {/* Контейнер інтерактивного прев'ю з твоїми формулами градієнтів */}
                    <div className="gradient-preview-viewport" style={gradientBackgroundStyle}>
                        <div className="viewport-inner-content">
                            <span className="app-mock-title">Glow Map</span>
                            <span className="app-mock-subtitle">rgba({activeAccentRgb}, 0.38)</span>
                        </div>
                    </div>

                    {/* Вибір кольорових нод */}
                    <div className="accent-nodes-list">
                        {ACCENT_PRESETS.map((preset) => {
                            const isCurrentNodeActive = activeAccentRgb === preset.rgb;
                            return (
                                <button
                                    key={preset.hex}
                                    className={`accent-node-circle ${isCurrentNodeActive ? 'node-active' : ''}`}
                                    style={{ backgroundColor: preset.hex }}
                                    onClick={() => handleCustomAccentSelect(preset.rgb)}
                                    title={preset.name}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* ЕСТЕТИЧНИЙ ЗАХИСНИЙ СКЛЯНИЙ БАНЕР ДЛЯ FREE КОРИСТУВАЧІВ */}
                {!isPremiumUser && (
                    <div className="premium-blur-overlay">
                        <div className="overlay-glass-card">
                            <span className="crown-icon">👑</span>
                            <h5 className="overlay-title">Create your own universe</h5>
                            <p className="overlay-text">Custom radial gradients and infinite layout personalization options are exclusive to Yuviron Premium.</p>
                            <button className="overlay-action-btn" onClick={() => alert('Redirecting to subscription gate...')}>
                                Upgrade to Premium
                            </button>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};