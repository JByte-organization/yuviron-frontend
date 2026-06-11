'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    useGetApiMeSettingsPreferences,
    usePutApiMeSettingsTheme,
    usePutApiMeSettingsAudioQuality,
    usePutApiMeSettingsAudioCrossfade,
    usePutApiMeSettingsPrivacy,
    usePutApiMeSettingsPrivateSession,
    getGetApiMeSettingsPreferencesQueryKey,
    type UserSettingsDto,
    type ThemeMode,
    type UpdatePrivacyTogglesCommand
} from '@repo/api/client';

import { AppearanceSettingsSection } from '@/features/settings/ui/AppearanceSettingsSection';

export const SettingsPreferencesPage = () => {
    const queryClient = useQueryClient();

    // Емулятор преміуму (можна замінити на реальний контекс сесії)
    const [isPremiumUser] = useState<boolean>(true);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    // ─── Запити даних (Безпечна типізація) ────────────────
    const { data: prefsRaw, isLoading: isPrefsLoading } = useGetApiMeSettingsPreferences();
    const prefs = (prefsRaw as { data?: UserSettingsDto })?.data ?? (prefsRaw as UserSettingsDto);

    // ─── Мутації налаштувань ──────────────────────────────
    const { mutateAsync: updateAudioQuality } = usePutApiMeSettingsAudioQuality();
    const { mutateAsync: updateCrossfade } = usePutApiMeSettingsAudioCrossfade();
    const { mutateAsync: updatePrivacy } = usePutApiMeSettingsPrivacy();
    const { mutateAsync: updatePrivateSession } = usePutApiMeSettingsPrivateSession();

    // ─── Локальні стейти ──────────────────────────────────
    const [localCrossfade, setLocalCrossfade] = useState<number>(0);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // 🚨 ФІКС НЕРАЦІОНАЛЬНОГО ЦИКЛУ: Синхронізуємо повзунок лише один раз при завантаженні
    useEffect(() => {
        if (prefs && !isInitialized) {
            setLocalCrossfade(prefs.crossfadeMs ?? 0);
            setIsInitialized(true);
        }
    }, [prefs, isInitialized]);

    if (isPrefsLoading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '50vh' }}>
                <div className="spinner-border spinner-border-sm text-secondary" role="status" />
            </div>
        );
    }

    // ─── Хендлери оновлення параметрів ───────────────────

    const triggerToast = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 3500);
    };

    const handleQualityChange = async (quality: number) => {
        try {
            await updateAudioQuality({ data: { audioQualityPreference: quality } });
            await queryClient.invalidateQueries({ queryKey: getGetApiMeSettingsPreferencesQueryKey() });

            const qualityLabels: Record<number, string> = { 1: 'Low', 2: 'Normal', 3: 'High', 4: 'Lossless' };
            triggerToast(`Audio quality streaming set to ${qualityLabels[quality] || 'Custom'}.`);
        } catch (err) {
            console.error('[Settings] Quality update failed:', err);
        }
    };

    const handleCrossfadeCommit = async (value: number) => {
        try {
            await updateCrossfade({ data: { crossfadeMs: value } });
            await queryClient.invalidateQueries({ queryKey: getGetApiMeSettingsPreferencesQueryKey() });
            triggerToast(`Playback crossfade transition adjusted to ${(value / 1000).toFixed(1)}s.`);
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
            triggerToast(field === 'playlists' ? 'Default playlist visibility altered.' : 'Social network board updated.');
        } catch (err) {
            console.error('[Settings] Privacy toggles failed:', err);
        }
    };

    const handlePrivateSessionToggle = async () => {
        if (!isPremiumUser) return;
        try {
            await updatePrivateSession({ data: { privateSession: !prefs?.privateSession } });
            await queryClient.invalidateQueries({ queryKey: getGetApiMeSettingsPreferencesQueryKey() });
            triggerToast(!prefs?.privateSession ? 'Private session activated. Algorithmic logs paused.' : 'Returned to public streaming session.');
        } catch (err) {
            console.error('[Settings] Private session toggle failed:', err);
        }
    };

    return (
        <div className="yuviron-settings container">
            <header className="settings-header">
                <h1 className="settings-title">Settings</h1>
                <p className="settings-subtitle">Account preferences and playback configurations.</p>
            </header>

            <div className="d-flex flex-column gap-5">
                {/* СЕКЦІЯ 1: APPEARANCE */}
                <section className="settings-section">
                    <h3 className="section-caption">Appearance</h3>
                    <AppearanceSettingsSection />
                </section>

                <hr className="border-secondary my-0" style={{ opacity: 0.03 }} />

                {/* СЕКЦІЯ 2: AUDIO QUALITY */}
                <section className="settings-section">
                    <h3 className="section-caption">Audio Experience</h3>

                    <div className="settings-row">
                        <div className="settings-info">
                            <span className="settings-label">Audio Quality</span>
                            <p className="settings-description">Stream bitrate capacity. High quality requires more network bandwidth.</p>
                        </div>
                        <div className="minimal-select-wrapper">
                            <select
                                className="minimal-input minimal-select"
                                value={prefs?.audioQualityPreference ?? 2}
                                onChange={(e) => handleQualityChange(Number(e.target.value))}
                            >
                                <option value={1}>Low (96 kbps)</option>
                                <option value={2}>Normal (160 kbps)</option>
                                <option value={3}>High (320 kbps)</option>
                                <option value={4}>Lossless (AAC)</option>
                            </select>
                        </div>
                    </div>

                    {/* КРОССФЕЙД */}
                    <div className="settings-row flex-column align-items-stretch gap-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="settings-info">
                                <span className="settings-label">Crossfade Transition</span>
                                <p className="settings-description">Smooth audio cross-fading between tracks overlap.</p>
                            </div>
                            <span className="range-value">{(localCrossfade / 1000).toFixed(1)}s</span>
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

                <hr className="border-secondary my-0" style={{ opacity: 0.03 }} />

                {/* СЕКЦІЯ 3: PRIVACY */}
                <section className="settings-section">
                    <h3 className="section-caption">Social & Privacy</h3>

                    <div className="settings-row">
                        <div className="settings-info">
                            <span className="settings-label">Public Playlists</span>
                            <p className="settings-description">Publish new playlist compilations to your profile by default.</p>
                        </div>

                        {/* Наш фірмовий кібер-чекбокс */}
                        <label className="yuviron-checkbox-wrapper">
                            <input
                                type="checkbox"
                                id="playlistToggle"
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
                            <span className="settings-label">Show Followers</span>
                            <p className="settings-description">Display follower list inside your public network layout board.</p>
                        </div>

                        <label className="yuviron-checkbox-wrapper">
                            <input
                                type="checkbox"
                                id="followersToggle"
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
                                Private Session
                                {!isPremiumUser && <span className="premium-pill">Premium</span>}
                            </span>
                            <p className="settings-description">Anonymize listening logs. Plays won't affect recommendation algorithms.</p>
                        </div>

                        <label className="yuviron-checkbox-wrapper">
                            <input
                                type="checkbox"
                                id="privateSessionToggle"
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

            {/* 🚨 ПЛАВАЮЧИЙ ТОСТ НАД СКРОЛОМ */}
            {successMessage && (
                <div className="yuviron-alert alert-success-toast">
                    <i className="bi bi-check-circle-fill alert-icon" />
                    <div className="alert-content">{successMessage}</div>
                </div>
            )}
        </div>
    );
};