'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    useGetApiAuthMe,
    useGetApiMeSettingsPreferences,
    usePutApiMeSettingsAudioQuality,
    usePutApiMeSettingsAudioCrossfade,
    usePutApiMeSettingsPrivacy,
    usePutApiMeSettingsPrivateSession,
    getGetApiMeSettingsPreferencesQueryKey,
    customInstance,
    type UserSettingsDto,
    type UpdatePrivacyTogglesCommand,
    type CurrentUserDto
} from '@repo/api/client';

import { AppearanceSettingsSection } from '@/features/settings/ui/AppearanceSettingsSection';
import { applyThemeGradients, type ClientThemeDto } from '@/shared/lib/applyThemeGradients';

export const SettingsPreferencesPage = () => {
    const queryClient = useQueryClient();
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    // ─── Реальна сесія користувача ────────────────────────
    const { data: meRaw, isLoading: isUserLoading } = useGetApiAuthMe();
    const me = (meRaw as CurrentUserDto) ?? null;
    const isPremiumUser = me?.isPremium ?? false;

    // ─── Запити даних конфігурації ────────────────────────
    const { data: prefsRaw, isLoading: isPrefsLoading } = useGetApiMeSettingsPreferences();
    const prefs = (prefsRaw as { data?: UserSettingsDto })?.data ?? (prefsRaw as UserSettingsDto);

    // ─── Завантаження доступних амбієнтних пресетів ───
    const { data: themesRaw, isLoading: isThemesLoading } = useQuery({
        queryKey: ['api', 'client', 'appearance', 'themes'],
        queryFn: ({ signal }) => customInstance<any>('/api/me/appearance/themes', { method: 'GET', signal }),
        enabled: isPremiumUser,
        retry: false,
        staleTime: 1000 * 60 * 15,
    });

    const availableThemes = useMemo(() => {
        const raw = (themesRaw as any)?.data ?? themesRaw;
        return (Array.isArray(raw) ? raw : raw?.items ?? []) as ClientThemeDto[];
    }, [themesRaw]);

    // ─── Мутації налаштувань ──────────────────────────────
    const { mutateAsync: updateAudioQuality } = usePutApiMeSettingsAudioQuality();
    const { mutateAsync: updateCrossfade } = usePutApiMeSettingsAudioCrossfade();
    const { mutateAsync: updatePrivacy } = usePutApiMeSettingsPrivacy();
    const { mutateAsync: updatePrivateSession } = usePutApiMeSettingsPrivateSession();

    // ─── Локальні стейти інтерактива ──────────────────────
    const [localCrossfade, setLocalCrossfade] = useState<number>(0);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (prefs && !isInitialized) {
            setLocalCrossfade(prefs.crossfadeMs ?? 0);
            setIsInitialized(true);
        }
    }, [prefs, isInitialized]);

    useEffect(() => {
        if (prefs) {
            applyThemeGradients(prefs.themeId, availableThemes);
        }
    }, [prefs, availableThemes]);

    if (isPrefsLoading || isUserLoading || isThemesLoading) {
        return (
            <div className="yuviron-loader-wrapper">
                <div className="cyber-spinner">
                    <div className="spinner-outer-ring" />
                    <div className="spinner-core-node" />
                </div>
                <span className="loader-diagnostic-text">Завантаження налаштувань клієнта...</span>
            </div>
        );
    }

    const triggerToast = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 3500);
    };

    const handleQualityChange = async (quality: number) => {
        try {
            await updateAudioQuality({ data: { audioQualityPreference: quality } });
            await queryClient.invalidateQueries({ queryKey: getGetApiMeSettingsPreferencesQueryKey() });

            const qualityLabels: Record<number, string> = {
                1: 'Низька',
                2: 'Звичайна',
                3: 'Висока',
                4: 'Найвища (Lossless AAC)'
            };
            triggerToast(`Якість потокового аудіо встановлена на значення: ${qualityLabels[quality] || 'Кастомна'}.`);
        } catch (err) {
            console.error('[Settings] Quality update failed:', err);
        }
    };

    const handleCrossfadeCommit = async (value: number) => {
        try {
            await updateCrossfade({ data: { crossfadeMs: value } });
            await queryClient.invalidateQueries({ queryKey: getGetApiMeSettingsPreferencesQueryKey() });
            triggerToast(`Плавний перехід між треками скориговано на ${(value / 1000).toFixed(1)} сек.`);
        } catch (err) {
            console.error('[Settings] Crossfade update failed:', err);
        }
    };

    const handlePrivacyToggle = async (field: 'playlists' | 'followers') => {
        const body: UpdatePrivacyTogglesCommand = {
            makePlaylistsPublicByDefault: field === 'playlists' ? !prefs?.makePlaylistsPublicByDefault : prefs?.makePlaylistsPublicByDefault,
            showFollowers: field === 'followers' ? !prefs?.showFollowers : prefs?.showFollowers
        };
        try {
            await updatePrivacy({ data: body });
            await queryClient.invalidateQueries({ queryKey: getGetApiMeSettingsPreferencesQueryKey() });
            triggerToast(field === 'playlists' ? 'Стандартну видимість нових плейлістів змінено.' : 'Стан дошки соціальної мережі оновлено.');
        } catch (err) {
            console.error('[Settings] Privacy toggles failed:', err);
        }
    };

    const handlePrivateSessionToggle = async () => {
        if (!isPremiumUser) return;
        try {
            await updatePrivateSession({ data: { privateSession: !prefs?.privateSession } });
            await queryClient.invalidateQueries({ queryKey: getGetApiMeSettingsPreferencesQueryKey() });
            triggerToast(!prefs?.privateSession ? 'Приватну сесію активовано. Запис алгоритмічних логів призупинено.' : 'Повернено до публічного режиму стрімінгу.');
        } catch (err) {
            console.error('[Settings] Private session toggle failed:', err);
        }
    };

    return (
        <div className="yuviron-settings py-5 animate-fade-in">
            <div className="container-lg">
                <header className="settings-header text-start mb-5">
                    <span className="settings-micro-headline mb-2">Панель керування</span>
                    <h1 className="settings-title tracking-tight">Налаштування</h1>
                    <p className="settings-subtitle">Конфігурація облікового запису та параметри відтворення медіапотоку.</p>
                </header>

                <div className="d-flex flex-column gap-5">
                    {/* СЕКЦІЯ 1: APPEARANCE */}
                    <section className="settings-section">
                        <h3 className="section-caption">Зовнішній вигляд</h3>
                        <AppearanceSettingsSection onToast={triggerToast} />
                    </section>

                    <hr className="settings-divider" />

                    {/* СЕКЦІЯ 2: AUDIO QUALITY */}
                    <section className="settings-section">
                        <h3 className="section-caption">Аудіо-досвід</h3>

                        <div className="settings-row">
                            <div className="settings-info">
                                <span className="settings-label">Якість звуку</span>
                                <p className="settings-description">Ємність бітрейту аудіопотоку. Висока якість потребує стабільного інтернет-з'єднання.</p>
                            </div>
                            <div className="minimal-select-wrapper">
                                <select
                                    className="minimal-select"
                                    value={prefs?.audioQualityPreference ?? 2}
                                    onChange={(e) => handleQualityChange(Number(e.target.value))}
                                >
                                    <option value={1}>Низька (96 кбіт/с)</option>
                                    <option value={2}>Звичайна (160 кбіт/с)</option>
                                    <option value={3}>Висока (320 кбіт/с)</option>
                                    <option value={4}>Найвища (Lossless AAC)</option>
                                </select>
                            </div>
                        </div>

                        {/* КРОССФЕЙД */}
                        <div className="settings-row flex-column align-items-stretch gap-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="settings-info">
                                    <span className="settings-label">Плавний перехід (Crossfade)</span>
                                    <p className="settings-description">Ефект м'якого накладання та згасання звуку між сусідніми аудіозаписами.</p>
                                </div>
                                <span className="range-value">{(localCrossfade / 1000).toFixed(1)} сек</span>
                            </div>
                            <div className="range-container">
                                <input
                                    type="range"
                                    className="minimal-range"
                                    min={0}
                                    max={12000}
                                    step={500}
                                    value={localCrossfade}
                                    onChange={(e) => setLocalCrossfade(Number(e.target.value))}
                                    onMouseUp={(e) => handleCrossfadeCommit(Number((e.target as HTMLInputElement).value))}
                                    onTouchEnd={(e) => handleCrossfadeCommit(Number((e.target as HTMLInputElement).value))}
                                />
                            </div>
                        </div>
                    </section>

                    <hr className="settings-divider" />

                    {/* СЕКЦІЯ 3: PRIVACY */}
                    <section className="settings-section">
                        <h3 className="section-caption">Соціальні мережі та приватність</h3>

                        <div className="settings-row">
                            <div className="settings-info">
                                <span className="settings-label">Публічні плейлісти</span>
                                <p className="settings-description">Робити створювані компіляції плейлістів відкритими для всіх користувачів за замовчуванням.</p>
                            </div>

                            <label className="yuviron-checkbox-wrapper">
                                <input
                                    type="checkbox"
                                    checked={prefs?.makePlaylistsPublicByDefault ?? false}
                                    onChange={() => handlePrivacyToggle('playlists')}
                                />
                                <div className="custom-checkbox-box">
                                    <i className="bi bi-check-lg check-icon" />
                                </div>
                            </label>
                        </div>

                        <div className="settings-row">
                            <div className="settings-info">
                                <span className="settings-label">Показувати підписників</span>
                                <p className="settings-description">Відображати повний список підписників у вашій публічній картці профілю.</p>
                            </div>

                            <label className="yuviron-checkbox-wrapper">
                                <input
                                    type="checkbox"
                                    checked={prefs?.showFollowers ?? false}
                                    onChange={() => handlePrivacyToggle('followers')}
                                />
                                <div className="custom-checkbox-box">
                                    <i className="bi bi-check-lg check-icon" />
                                </div>
                            </label>
                        </div>

                        <div className={`settings-row ${!isPremiumUser ? 'disabled' : ''}`}>
                            <div className="settings-info">
                            <span className="settings-label d-flex align-items-center gap-2">
                                Приватна сесія
                                {!isPremiumUser && <span className="premium-pill">Premium</span>}
                            </span>
                                <p className="settings-description">Повна анонімізація журналів прослуховування контенту. Треки не впливатимуть на рекомендаційні алгоритми.</p>
                            </div>

                            <label className="yuviron-checkbox-wrapper">
                                <input
                                    type="checkbox"
                                    disabled={!isPremiumUser}
                                    checked={prefs?.privateSession ?? false}
                                    onChange={handlePrivateSessionToggle}
                                />
                                <div className="custom-checkbox-box">
                                    <i className="bi bi-check-lg check-icon" />
                                </div>
                            </label>
                        </div>
                    </section>
                </div>

                {successMessage && (
                    <div className="yuviron-alert alert-success-toast">
                        <i className="bi bi-check-circle-fill alert-icon" />
                        <div className="alert-content">{successMessage}</div>
                    </div>
                )}
            </div>
        </div>
    );
};