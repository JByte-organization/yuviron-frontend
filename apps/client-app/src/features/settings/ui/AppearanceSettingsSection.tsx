'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    useGetApiAuthMe,
    useGetApiMeSettingsPreferences,
    usePutApiMeSettingsTheme,
    usePutApiMeAppearanceCustomTheme,
    getGetApiMeSettingsPreferencesQueryKey,
    type ThemeMode,
    type CurrentUserDto,
    type UserSettingsDto
} from '@repo/api/client';
import { useTheme } from '@/shared/lib/ThemeProvider';

export const AppearanceSettingsSection = () => {
    const queryClient = useQueryClient();
    const { theme: localTheme, toggleTheme } = useTheme();

    // ─── Запити даних ─────────────────────────────────
    const { data: meRaw } = useGetApiAuthMe();
    const me = (meRaw as CurrentUserDto) ?? null;
    const isPremium = me?.isPremium ?? false;

    const { data: prefsRaw } = useGetApiMeSettingsPreferences();
    const prefs = (prefsRaw as { data?: UserSettingsDto })?.data ?? (prefsRaw as UserSettingsDto);

    // ─── Мутації ──────────────────────────────────────────
    const { mutateAsync: updateBaseTheme } = usePutApiMeSettingsTheme();
    const { mutateAsync: updateCustomTheme } = usePutApiMeAppearanceCustomTheme();

    // ─── Локальні кольори конструктора ────────────────────
    const [primaryColor, setPrimaryColor] = useState('#7AE0FF');
    const [secondaryColor, setSecondaryColor] = useState('#1D4ED8');
    const [backgroundColor, setBackgroundColor] = useState('#0B0C12');
    const [isSaving, setIsSaving] = useState(false);

    const handleModeChange = async (mode: ThemeMode) => {
        if (mode === 'White' && localTheme !== 'light') toggleTheme();
        else if (mode === 'Dark' && localTheme !== 'dark') toggleTheme();

        try {
            await updateBaseTheme({ data: { themeMode: mode } });
            await queryClient.invalidateQueries({ queryKey: getGetApiMeSettingsPreferencesQueryKey() });
        } catch (err) {
            console.error('[ThemeMode] Failed to save mode:', err);
        }
    };

    const handleSaveGradient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isPremium) return;
        setIsSaving(true);

        try {
            await updateCustomTheme({
                data: {
                    primaryColor: primaryColor.toUpperCase(),
                    secondaryColor: secondaryColor.toUpperCase(),
                    backgroundColor: backgroundColor.toUpperCase()
                }
            });

            await queryClient.invalidateQueries({ queryKey: getGetApiMeSettingsPreferencesQueryKey() });
            alert('Custom layout mapping successfully deployed.');
        } catch (err) {
            console.error('[CustomTheme] 400 Validation Crash:', err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="yuviron-settings-appearance d-flex flex-column gap-4">

            {/* 🌗 БЛОК 1: ПЕРЕМИКАЧ РЕЖИМІВ ИНТЕРФЕЙСУ */}
            <div className="appearance-card-v2 p-4 rounded-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        {/* 🌟 ФІКС: Прибрано text-white, колір йде з .card-label */}
                        <span className="card-label d-block fw-bold mb-1">Interface Base Shell</span>
                        {/* 🌟 ФІКС: Прибрано text-muted, колір йде з .card-description */}
                        <p className="card-description small mb-0">Select your preferred client layout canvas scheme.</p>
                    </div>

                    <div className="aesthetic-segmented-v2">
                        {(['System', 'Dark', 'White'] as ThemeMode[]).map((mode) => {
                            const isActive = prefs?.themeMode === mode;
                            return (
                                <button
                                    key={mode}
                                    type="button"
                                    className={`segmented-btn-v2 ${isActive ? 'active-mode-bold' : ''}`}
                                    onClick={() => handleModeChange(mode)}
                                >
                                    {mode}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 🔮 БЛОК 2: АМБІЄНТНЕ НАЛАШТУВАННЯ ДЛЯ PREMIUM */}
            <div className="appearance-card-v2 p-4 rounded-4 position-relative overflow-hidden">
                {!isPremium && (
                    <div className="premium-blur-overlay-v2 rounded-4 text-center p-4">
                        <div className="overlay-glass-card-v2 p-4 rounded-4">
                            <i className="bi bi-crown-fill crown-icon-v2 mb-2" />
                            {/* 🌟 ФІКС: Прибрано text-white, стилі беруться з контейнера */}
                            <h5 className="fw-bold mb-1 overlay-title">Theme Laboratory Gated</h5>
                            {/* 🌟 ФІКС: Прибрано text-muted */}
                            <p className="small mb-0 overlay-desc">Custom radial gradients and layout personalization fields require active Premium status.</p>
                        </div>
                    </div>
                )}

                <div className="mb-2">
                    {/* 🌟 ФІКС: Прибрано text-white */}
                    <span className="card-label d-block fw-bold mb-1">Ambient Universe Customization</span>
                    {/* 🌟 ФІКС: Прибрано text-muted */}
                    <p className="card-description small mb-4">Pick an accent color node to re-generate the dynamic layout background glow mapping.</p>
                </div>

                <form onSubmit={handleSaveGradient} className="d-flex flex-column gap-4">
                    <div className="d-flex align-items-center gap-4 flex-wrap flex-md-nowrap">
                        <div
                            className="gradient-preview-viewport-v2 flex-grow-1 rounded-3 p-3 d-flex align-items-end"
                            style={{ background: `linear-gradient(135deg, ${backgroundColor} 0%, ${secondaryColor} 50%, ${primaryColor} 100%)` }}
                        >
                            <div className="viewport-content-v2">
                                <span className="v-title">Active Universe Node</span>
                                <span className="v-sub font-monospace">HEX mapping system</span>
                            </div>
                        </div>

                        <div className="color-node-pickers-stack d-flex flex-column gap-2 flex-shrink-0">
                            <div className="premium-color-slot-row">
                                <div className="color-input-circle-wrapper">
                                    <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                                </div>
                                <span className="node-title-text">Primary Accent ({primaryColor.toUpperCase()})</span>
                            </div>
                            <div className="premium-color-slot-row">
                                <div className="color-input-circle-wrapper">
                                    <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
                                </div>
                                <span className="node-title-text">Dynamic Fog ({secondaryColor.toUpperCase()})</span>
                            </div>
                            <div className="premium-color-slot-row">
                                <div className="color-input-circle-wrapper">
                                    <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
                                </div>
                                <span className="node-title-text">Deep Ground ({backgroundColor.toUpperCase()})</span>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end mt-2">
                        <button type="submit" className="yuviron-btn-minimal py-2 px-4" disabled={isSaving || !isPremium}>
                            {isSaving ? 'Deploying Nodes...' : 'Apply Cosmic Layout'}
                        </button>
                    </div>
                </form>
            </div>

            {/* 🛠️ ДЕВЕЛОПЕРСЬКИЙ КАНАЛ */}
            {/*{process.env.NODE_ENV !== 'production' && (*/}
            {/*    <div className="dev-debug-pill-container p-2 rounded-3 mt-4 text-center">*/}
            {/*        <span className="font-monospace text-warning" style={{ fontSize: '10px', fontWeight: 700 }}>*/}
            {/*            ⚙️ LOCAL DEV ENVIRONMENT • VERIFIED RE-FETCH CLIENT ENGINES ACTIVE*/}
            {/*        </span>*/}
            {/*    </div>*/}
            {/*)}*/}
        </div>
    );
};