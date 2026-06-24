'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    useGetApiAuthMe,
    useGetApiPlans,
    usePostApiPaymentsCheckout,
    useGetApiMeAppearanceThemes,
    usePutApiMeAppearanceThemesIdActivate,
    useGetApiMeAppearanceCustomTheme,
    usePutApiMeAppearanceCustomTheme,
    getGetApiMeAppearanceThemesQueryKey,
    getGetApiMeAppearanceCustomThemeQueryKey,
    getGetApiAuthMeQueryKey,
    type CurrentUserDto,
    type PlanDto,
    type ThemeDto,
    type CustomThemeDto
} from '@repo/api/client';

const PlanPeriod = {
    Unknown: "Unknown",
    Month: "Month",
    Year: "Year",
} as const;

const PlanType = {
    Unknown: "Unknown",
    Listener: "Listener",
    Artist: "Artist",
} as const;

export const PremiumHubView = () => {
    const queryClient = useQueryClient();

    // ─── Сесія Користувача ────────────────────────────────
    const { data: meRaw, isLoading: isUserLoading } = useGetApiAuthMe();
    const me = (meRaw as CurrentUserDto) ?? null;
    const isPremium = me?.isPremium ?? false;

    // ─── Запит тарифних планів з бази даних ──────────────
    const { data: plansRaw, isLoading: isPlansLoading } = useGetApiPlans();
    // Забираємо абсолютно всі плани без виключень
    const plans: PlanDto[] = (plansRaw as any)?.data || plansRaw || [];

    // ─── Запити даних тем ─────────────────────────────────
    const { data: themesRaw, isLoading: isThemesLoading } = useGetApiMeAppearanceThemes();
    const themes: ThemeDto[] = themesRaw && Array.isArray((themesRaw as any).data) ? (themesRaw as any).data : [];

    const { data: customThemeRaw } = useGetApiMeAppearanceCustomTheme({
        query: {
            queryKey: getGetApiMeAppearanceCustomThemeQueryKey(),
            enabled: isPremium
        }
    });
    const customTheme = (customThemeRaw as any)?.data as CustomThemeDto | undefined;

    // ─── Мутації ──────────────────────────────────────────
    const { mutateAsync: checkout } = usePostApiPaymentsCheckout();
    const { mutateAsync: activateThemePreset } = usePutApiMeAppearanceThemesIdActivate();
    const { mutateAsync: updateCustomTheme } = usePutApiMeAppearanceCustomTheme();

    // ─── Локальні стейти Лабораторії кольору ──────────────
    const [primaryColor, setPrimaryColor] = useState('#7AE0FF');
    const [secondaryColor, setSecondaryColor] = useState('#1D4ED8');
    const [backgroundColor, setBackgroundColor] = useState('#0B0C12');

    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSavingCustom, setIsSavingCustom] = useState(false);

    useEffect(() => {
        if (customTheme) {
            setPrimaryColor(customTheme.primaryColor ?? '#7AE0FF');
            setSecondaryColor(customTheme.secondaryColor ?? '#1D4ED8');
            setBackgroundColor(customTheme.backgroundColor ?? '#0B0C12');
        }
    }, [customTheme]);

    if (isUserLoading || isPlansLoading || isThemesLoading) {
        return (
            <div className="yuviron-loader-wrapper text-center py-5">
                <div className="cyber-spinner mb-3 mx-auto">
                    <div className="spinner-outer-ring" />
                    <div className="spinner-core-node" />
                </div>
                <div className="loader-diagnostic-text font-monospace small text-muted">Synchronizing billing nodes...</div>
            </div>
        );
    }

    const triggerToast = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 4000);
    };

    // ФІКС РЕДІРЕКТУ НА STRIPE
    const handleSubscribe = async (planId: string | undefined) => {
        if (!planId) return;
        try {
            const origin = window.location.origin;

            const response = await checkout({
                data: {
                    planId,
                    successUrl: `${origin}/payment/success`,
                    cancelUrl: `${origin}/payment/cancel`,
                    SuccessUrl: `${origin}/payment/success`,
                    CancelUrl: `${origin}/payment/cancel`
                } as any
            });

            // Дістаємо тіло відповіді залежно від налаштувань Axios перехоплювачів
            const resBody = (response as any)?.data || response;

            // Точково витягуємо властивість "url" з об'єкта, який повернув ваш бекенд
            const redirectUrl = resBody?.url || (typeof resBody === 'string' ? resBody : null);

            if (redirectUrl) {
                window.location.href = redirectUrl; // Прямий перехід на Stripe Checkout
            } else {
                console.error('[Billing] URL property key missing in response payload structure:', response);
            }
        } catch (err) {
            console.error('[Billing] Checkout initiation stream failed:', err);
        }
    };

    const handlePresetActivate = async (themeId: string | undefined, isPresetPremium: boolean | undefined) => {
        if (!themeId) return;
        if (isPresetPremium && !isPremium) return;

        try {
            await activateThemePreset({ id: themeId });
            await queryClient.invalidateQueries({ queryKey: getGetApiMeAppearanceThemesQueryKey() });
            await queryClient.invalidateQueries({ queryKey: getGetApiAuthMeQueryKey() });
            triggerToast('Color node configuration applied successfully.');
        } catch (err) {
            console.error('[Theme] Activation failed:', err);
        }
    };

    const handleSaveCustomTheme = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isPremium) return;
        setIsSavingCustom(true);

        try {
            await updateCustomTheme({
                data: { primaryColor, secondaryColor, backgroundColor }
            });
            await queryClient.invalidateQueries({ queryKey: getGetApiMeAppearanceCustomThemeQueryKey() });
            triggerToast('Your personal custom gradient layer has been deployed.');
        } catch (err) {
            console.error('[Theme] Custom save failed:', err);
        } finally {
            setIsSavingCustom(false);
        }
    };

    return (
        <div className="premium-hub-wrapper container py-5">

            {/* ГЕРОЙ-БАННЕР */}
            <header className="premium-hub-hero text-center mb-5 p-5 rounded-4">
                <span className="hero-badge px-3 py-1 rounded-pill mb-2 d-inline-block">Yuviron Premium</span>
                <h1 className="fw-black text-white display-5 mb-3 tracking-tight mt-2">
                    {isPremium ? 'Welcome to Premium Studio' : 'Unlock Maximum Acoustic Fidelity'}
                </h1>
                <p className="text-secondary mx-auto mb-0" style={{ maxWidth: '600px', fontSize: '15px', lineHeight: '1.6' }}>
                    Experience unrestricted spatial rendering, native lossless compilation nodes, and deep client layout customization options.
                </p>
            </header>

            {/* СІТКА ТАРИФІВ (СТАБІЛЬНО ВІДОБРАЖАЄ ВСІ 3 ПЛАНИ З БД В ОДИН РЯД) */}
            <section className="mb-5">
                <h3 className="hub-section-title mb-4 tracking-tight">Pick Your Premium Level</h3>
                <div className="plans-grid-system">
                    {plans.map((plan: PlanDto) => {
                        // Евристика визначення поточного активного тарифу користувача
                        const isCurrentPlan = isPremium && plan.type === PlanType.Listener;
                        return (
                            <div
                                key={plan.id}
                                className={`plan-premium-card p-4 rounded-4 ${isCurrentPlan ? 'current-active-plan' : ''}`}
                            >
                                <div className="card-top-details">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <h4 className="fw-bold text-white mb-0">{plan.name || 'Premium Tier'}</h4>
                                        {isCurrentPlan && <span className="current-badge">Active</span>}
                                    </div>

                                    <div className="plan-price-tag my-3">
                                        <span className="price-amount text-white fw-black fs-2">{plan.price}</span>
                                        <span className="text-white-50 small"> {plan.currency || 'USD'} / {plan.period?.toLowerCase()}</span>
                                    </div>

                                    <hr className="border-secondary my-3" style={{ opacity: 0.1 }} />

                                    <ul className="feature-list">
                                        <li>32-bit FLAC High-Fidelity audio</li>
                                        <li>Unrestricted spatial rendering maps</li>
                                        <li>Zero commercial advertisement modules</li>
                                        <li>Exclusive access to Aesthetic Workspace</li>
                                    </ul>
                                </div>

                                <div className="card-action-block mt-4">
                                    <button
                                        type="button"
                                        className={isCurrentPlan ? 'yuviron-btn-minimal py-2.5' : 'yuviron-btn-cosmic-glow py-2.5'}
                                        disabled={isCurrentPlan}
                                        onClick={() => handleSubscribe(plan.id)}
                                    >
                                        {isCurrentPlan ? 'Current Tier Account' : 'Upgrade Profile'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* РОБОЧИЙ ПРОСТІР ТЕМ */}
            <section className="row">
                <div className="col-12">
                    <h3 className="hub-section-title mb-4 tracking-tight">Aesthetic Studio Node</h3>
                    <div className="theme-workspace-card p-4 rounded-4 position-relative overflow-hidden">

                        {/* 🔒 GLASSMORPHISM OVERLAY ДЛЯ FREE ЮЗЕРОВ */}
                        {!isPremium && (
                            <div className="premium-blur-overlay rounded-4 text-center p-4">
                                <div className="overlay-glass-card p-4 rounded-4 text-center">
                                    <i className="bi bi-crown-fill crown-icon mb-2" />
                                    <h5 className="fw-bold text-white mb-2 tracking-tight">Laboratory Matrix Gated</h5>
                                    <p className="text-secondary small mb-4 px-2" style={{ color: '#a7a7a7', lineHeight: '1.5' }}>
                                        Custom gradient-map configurations, custom personal nodes and palette catalogs are exclusive to Premium account configurations.
                                    </p>
                                    <button
                                        type="button"
                                        className="yuviron-btn-cosmic-glow py-2.5 px-4 text-uppercase fw-bold"
                                        style={{ fontSize: '12px' }}
                                        onClick={() => handleSubscribe(plans[1]?.id || plans[0]?.id)}
                                    >
                                        Unlock Design Studio
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="row g-4">
                            {/* Каталог пресетів */}
                            <div className="col-12 col-md-6">
                                <label className="input-label mb-3 d-block text-white-50 small fw-bold text-uppercase">Preset Palette Catalog</label>
                                <div className="catalog-theme-grid">
                                    {themes.map((themeItem: ThemeDto) => (
                                        <button
                                            key={themeItem.id}
                                            type="button"
                                            className={`preset-circle-card ${themeItem.isSelected ? 'selected-preset' : ''}`}
                                            onClick={() => handlePresetActivate(themeItem.id, themeItem.isPremiumOnly)}
                                        >
                                            <div className="triple-dot-preview" style={{ background: themeItem.backgroundColor ?? '#111' }}>
                                                <span className="dot-node" style={{ background: themeItem.primaryColor ?? '#7AE0FF' }} />
                                                <span className="dot-node" style={{ background: themeItem.secondaryColor ?? '#1D4ED8' }} />
                                            </div>
                                            <span className="preset-name text-truncate d-block">{themeItem.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Конструктор градієнта */}
                            <div className="col-12 col-md-6">
                                <form onSubmit={handleSaveCustomTheme} className="premium-generator-layout d-flex flex-column gap-3">
                                    <label className="input-label mb-0 text-white-50 small fw-bold text-uppercase">Linear-Gradient Generator</label>

                                    <div className="d-flex gap-3 align-items-center">
                                        <div
                                            className="gradient-preview-viewport flex-grow-1 rounded-3 p-3 d-flex align-items-end"
                                            style={{ background: `linear-gradient(135deg, ${backgroundColor} 0%, ${secondaryColor} 50%, ${primaryColor} 100%)` }}
                                        >
                                            <div className="viewport-inner-content">
                                                <span className="app-mock-title d-block fw-bold small text-white">Canvas Layer</span>
                                                <span className="app-mock-subtitle font-monospace text-white-50" style={{ fontSize: '10px' }}>Live Shader Engine</span>
                                            </div>
                                        </div>

                                        <div className="d-flex flex-column gap-2 flex-shrink-0">
                                            <div className="color-picker-node-row gap-3">
                                                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                                                <span>Primary</span>
                                            </div>
                                            <div className="color-picker-node-row gap-3">
                                                <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
                                                <span>Middle</span>
                                            </div>
                                            <div className="color-picker-node-row gap-3">
                                                <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
                                                <span>Base</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-end mt-2">
                                        <button type="submit" className="yuviron-btn-cosmic-glow py-2 px-4" style={{ width: 'auto' }} disabled={isSavingCustom}>
                                            {isSavingCustom ? 'Deploying Configuration...' : 'Deploy Live Palette'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ТОСТ НА ПОВЕРХНІ */}
            {successMessage && (
                <div className="position-fixed bottom-0 end-0 m-4 p-3 rounded-3 shadow-lg border border-success bg-dark text-success" style={{ zIndex: 1100 }}>
                    <span className="small fw-semibold">✓ {successMessage}</span>
                </div>
            )}
        </div>
    );
};