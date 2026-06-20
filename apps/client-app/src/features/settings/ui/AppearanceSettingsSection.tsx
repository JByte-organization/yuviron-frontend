'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    useGetApiAuthMe,
    useGetApiMeSettingsPreferences,
    usePutApiMeSettingsTheme,
    getGetApiMeSettingsPreferencesQueryKey,
    customInstance,
    type ThemeMode,
    type CurrentUserDto,
    type UserSettingsDto,
    type UpdateThemeCommand
} from '@repo/api/client';
import { useTheme } from '@/shared/lib/ThemeProvider';
import { applyThemeGradients, type ClientThemeDto } from '@/shared/lib/applyThemeGradients';

interface AppearanceSettingsSectionProps {
    onToast?: (msg: string) => void;
}

export const AppearanceSettingsSection = ({ onToast }: AppearanceSettingsSectionProps) => {
    const queryClient = useQueryClient();
    const { theme: localTheme, toggleTheme } = useTheme();

    const { data: meRaw } = useGetApiAuthMe();
    const me = (meRaw as CurrentUserDto) ?? null;
    const isPremium = me?.isPremium ?? false;

    const { data: prefsRaw } = useGetApiMeSettingsPreferences();
    const prefs = (prefsRaw as { data?: UserSettingsDto })?.data ?? (prefsRaw as UserSettingsDto);

    // ─── 🚨 ФІКС 1: Отримання списку тем з правильного ендпоінту ───────────
    const { data: themesRaw, isLoading: isThemesLoading } = useQuery({
        queryKey: ['api', 'client', 'appearance', 'themes'],
        queryFn: ({ signal }) => customInstance<any>('/api/me/appearance/themes', { method: 'GET', signal }),
        enabled: isPremium,
        retry: false,
        staleTime: 1000 * 60 * 15,
    });

    const availableThemes = useMemo(() => {
        const raw = (themesRaw as any)?.data ?? themesRaw;
        return (Array.isArray(raw) ? raw : raw?.items ?? []) as ClientThemeDto[];
    }, [themesRaw]);

    const { mutateAsync: updateTheme, isPending: isModeSaving } = usePutApiMeSettingsTheme();
    const [isThemeActivating, setIsThemeActivating] = useState(false);
    const isSaving = isModeSaving || isThemeActivating;

    useEffect(() => {
        if (prefs) {
            applyThemeGradients(prefs.themeId, availableThemes);
        }
    }, [prefs, availableThemes]);

    const handleModeChange = async (mode: ThemeMode) => {
        if (mode === 'White' && localTheme !== 'light') toggleTheme();
        else if (mode === 'Dark' && localTheme !== 'dark') toggleTheme();

        try {
            await updateTheme({
                data: {
                    themeMode: mode,
                    themeId: prefs?.themeId ?? null
                } as unknown as UpdateThemeCommand
            });
            await queryClient.invalidateQueries({ queryKey: getGetApiMeSettingsPreferencesQueryKey() });
            onToast?.(`Режим інтерфейсу змінено на ${mode}.`);
        } catch (err) {
            console.error('[ThemeMode] Failed to save mode:', err);
        }
    };

    // ─── 🚨 ФІКС 2: Активація теми через виділений роут Сваггера ───────────
    const handleSelectPreset = async (theme: ClientThemeDto) => {
        if (!isPremium || isSaving || !theme.id) return;
        setIsThemeActivating(true);

        try {
            // Викликаємо нативний PUT-метод активації зі скріншоту Сваггера
            await customInstance(`/api/me/appearance/themes/${theme.id}/activate`, {
                method: 'PUT'
            });

            // 🚨 ФІКС: Передаємо 2 аргументи (ID нової теми та поточний масив тем)
            applyThemeGradients(theme.id, availableThemes);

            await queryClient.invalidateQueries({ queryKey: getGetApiMeSettingsPreferencesQueryKey() });
            onToast?.(`Амбієнтну тему успішно змінено на "${theme.name}".`);
        } catch (err) {
            console.error('[PremiumTheme] Failed to activate theme preset:', err);
        } finally {
            setIsThemeActivating(false);
        }
    };

    return (
        <div className="yuviron-settings-appearance d-flex flex-column gap-4">
            {/* БЛОК 1: INTERFACE BASE SHELL */}
            <div className="appearance-card-v2 p-4 rounded-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <span className="card-label d-block fw-bold mb-1">Interface Base Shell</span>
                        <p className="card-description small mb-0">Select your preferred client layout canvas scheme.</p>
                    </div>

                    <div className="aesthetic-segmented-v2">
                        {(['System', 'Dark', 'White'] as ThemeMode[]).map((mode) => {
                            const isActive = prefs?.themeMode === mode;
                            return (
                                <button key={mode} type="button" className={`segmented-btn-v2 ${isActive ? 'active-mode-bold' : ''}`} onClick={() => handleModeChange(mode)}>
                                    {mode}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* БЛОК 2: AMBIENT UNIVERSE PRESET SELECTION */}
            <div className="appearance-card-v2 p-4 rounded-4 position-relative overflow-hidden">
                {!isPremium && (
                    <div className="premium-blur-overlay-v2 rounded-4 text-center p-4">
                        <div className="overlay-glass-card-v2 p-4 rounded-4">
                            <i className="bi bi-crown-fill crown-icon-v2 mb-2" />
                            <h5 className="fw-bold mb-1 overlay-title">Theme Laboratory Gated</h5>
                            <p className="small mb-0 overlay-desc">Custom approved ambient templates require active Premium status.</p>
                        </div>
                    </div>
                )}

                <div className="mb-4">
                    <span className="card-label d-block fw-bold mb-1">Ambient Universe Preset Selection</span>
                    <p className="card-description small mb-0">Choose one of the official volumetric layouts deployed by server administration.</p>
                </div>

                {isThemesLoading ? (
                    <div className="text-center py-4">
                        <div className="spinner-border text-info spinner-border-sm" role="status" />
                    </div>
                ) : availableThemes.length === 0 ? (
                    <div className="text-center py-3 text-muted small">Немає доступних пресетів у базі даних додатка.</div>
                ) : (
                    <div className="row g-3">
                        {availableThemes.map((preset) => {
                            const isSelected = prefs?.themeId === preset.id;
                            return (
                                <div key={preset.id} className="col-12 col-sm-6 col-md-3">
                                    <div
                                        className={`gradient-preview-viewport-v2 rounded-3 p-3 d-flex flex-column justify-content-between position-relative transition-all ${isSelected ? 'border border-cyan shadow-lg scale-102' : 'border border-transparent'}`}
                                        style={{
                                            background: `linear-gradient(135deg, ${preset.backgroundColor ?? '#000'} 0%, ${preset.secondaryColor ?? '#000'} 50%, ${preset.primaryColor ?? '#000'} 100%)`,
                                            minHeight: '125px',
                                            cursor: isPremium && !isSaving ? 'pointer' : 'not-allowed',
                                            opacity: isPremium ? 1 : 0.4
                                        }}
                                        onClick={() => handleSelectPreset(preset)}
                                    >
                                        <div className="d-flex justify-content-end w-100">
                                            {isSelected && (
                                                <span className="badge bg-cyan text-dark rounded-circle d-flex align-items-center justify-content-center" style={{ width: '22px', height: '22px' }}>
                                                    <i className="bi bi-check-lg" style={{ fontSize: '13px' }} />
                                                </span>
                                            )}
                                        </div>
                                        <div className="viewport-content-v2">
                                            <span className="v-title d-block fw-bold text-white small">{preset.name ?? 'Untitled Theme'}</span>
                                            <span className="v-sub font-monospace text-white-50 text-uppercase" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>
                                                Approved Preset
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};