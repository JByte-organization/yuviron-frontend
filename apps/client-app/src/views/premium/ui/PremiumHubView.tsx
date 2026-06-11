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

export const PremiumHubView = () => {
    const queryClient = useQueryClient();

    // ─── Сесія Користувача ────────────────────────────────
    const { data: meRaw, isLoading: isUserLoading } = useGetApiAuthMe();
    const me = (meRaw as CurrentUserDto) ?? null;
    const isPremium = me?.isPremium ?? false;

    // ─── Запити даних (Тарифи та Теми) ───────────────────
    const { data: plansRaw, isLoading: isPlansLoading } = useGetApiPlans();
    const plans: PlanDto[] = (plansRaw as any)?.data ?? [];

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

    // Ініціалізація кастомних кольорів, якщо у користувача вже є збережена власна тема
    useEffect(() => {
        if (customTheme) {
            setPrimaryColor(customTheme.primaryColor ?? '#7AE0FF');
            setSecondaryColor(customTheme.secondaryColor ?? '#1D4ED8');
            setBackgroundColor(customTheme.backgroundColor ?? '#0B0C12');
        }
    }, [customTheme]);

    if (isUserLoading || isPlansLoading || isThemesLoading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border spinner-border-sm text-secondary" role="status" />
            </div>
        );
    }

    // ─── Хендлери бізнес-логіки ───────────────────────────

    const triggerToast = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 4000);
    };

    // Оформлення підписки через Stripe/платіжний шлюз бенкенду
    const handleSubscribe = async (planId: string | undefined) => {
        if (!planId) return;
        try {
            const response = await checkout({
                data: { planId } // Відправляємо DTO CreateCheckoutRequest
            });

            const redirectUrl = (response as any)?.data;
            if (redirectUrl) {
                window.location.href = redirectUrl; // Перенаправлення на оплату
            }
        } catch (err) {
            console.error('[Billing] Checkout initiation failed:', err);
        }
    };

    // Активація готового пресету з каталогу
    const handlePresetActivate = async (themeId: string | undefined, isPresetPremium: boolean | undefined) => {
        if (!themeId) return;
        if (isPresetPremium && !isPremium) return; // Захист клієнтського рівня

        try {
            await activateThemePreset({ id: themeId });
            await queryClient.invalidateQueries({ queryKey: getGetApiMeAppearanceThemesQueryKey() });
            await queryClient.invalidateQueries({ queryKey: getGetApiAuthMeQueryKey() });
            triggerToast('Color node configuration applied successfully.');
        } catch (err) {
            console.error('[Theme] Activation failed:', err);
        }
    };

    // Збереження особистого Premium градієнта
    const handleSaveCustomTheme = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isPremium) return;
        setIsSavingCustom(true);

        try {
            await updateCustomTheme({
                data: { primaryColor, secondaryColor, backgroundColor } // UpdateCustomThemeCommand
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
            {/* ГОРДОСТЬ ДИЗАЙНА: ВЕРХНИЙ КОСМИЧЕСКИЙ БАННЕР */}
            <header className="premium-hub-hero text-center mb-5 p-5 rounded-4">
                <span className="hero-badge mb-2">Yuviron Exclusive</span>
                <h1 className="fw-black text-white display-5 mb-3">
                    {isPremium ? 'Welcome to Premium Studio' : 'Unlock Maximum Acoustic Fidelity'}
                </h1>
                <p className="text-secondary mx-auto" style={{ maxWidth: '580px', fontSize: '15px' }}>
                    Experience unrestricted spatial rendering, native lossless compilation nodes, and deep client layout customization options.
                </p>
            </header>

            <div className="row g-5">
                {/* ЛЕВАЯ ЧАСТЬ: ТАРИФНЫЕ ПЛАНЫ И КАРТОЧКИ */}
                <div className="col-12 col-xl-6">
                    <h3 className="hub-section-title mb-4">Subscription Ecosystem</h3>
                    <div className="d-flex flex-column gap-3">
                        {plans.map((plan: PlanDto) => {
                            const isCurrentPlan = isPremium && plan.type === 'Listener'; // Базова евристика поточного плану
                            return (
                                <div key={plan.id} className={`plan-premium-card p-4 rounded-4 d-flex justify-content-between align-items-center ${isCurrentPlan ? 'current-active-plan' : ''}`}>
                                    <div>
                                        <div className="d-flex align-items-center gap-2">
                                            <h5 className="fw-bold text-white mb-0">{plan.name}</h5>
                                            {isCurrentPlan && <span className="current-badge">Active</span>}
                                        </div>
                                        <p className="text-secondary small mt-2 mb-0" style={{ maxWidth: '300px' }}>
                                            Full integration layer access. Period: <span className="text-white text-capitalize">{plan.period?.toLowerCase()}</span>.
                                        </p>
                                    </div>
                                    <div className="text-end">
                                        <div className="plan-price-tag mb-3">
                                            <span className="price-amount text-white fw-black fs-4">${plan.price}</span>
                                            <span className="price-period text-secondary small">/{plan.period?.toLowerCase()}</span>
                                        </div>
                                        <button
                                            type="button"
                                            className={isCurrentPlan ? 'yuviron-btn-minimal' : 'yuviron-btn-cosmic-glow py-2 px-4'}
                                            disabled={isCurrentPlan}
                                            onClick={() => handleSubscribe(plan.id)}
                                        >
                                            {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ПРАВАЯ ЧАСТЬ: ИНТЕРАКТИВНАЯ ЛАБОРАТОРИЯ ЦВЕТА */}
                <div className="col-12 col-xl-6">
                    <h3 className="hub-section-title mb-4">Aesthetic Workspace</h3>

                    <div className="theme-workspace-card p-4 rounded-4 position-relative">
                        {/* 🔒 GLASSMORPHISM OVERLAY ДЛЯ FREE ЮЗЕРОВ */}
                        {!isPremium && (
                            <div className="premium-blur-overlay rounded-4 text-center p-4">
                                <div className="overlay-glass-card p-4 rounded-4">
                                    <i className="bi bi-crown-fill crown-icon mb-2" />
                                    <h5 className="fw-bold text-white mb-2">Premium Laboratory Gated</h5>
                                    <p className="text-secondary small mb-4">
                                        Custom gradient-map configurations, custom personal nodes and palette catalogs are exclusive to Premium account configurations.
                                    </p>
                                    <button type="button" className="yuviron-btn-cosmic-glow py-2.5 px-4" onClick={() => handleSubscribe(plans[0]?.id)}>
                                        Unlock Theme Studio
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* КАТАЛОГ ГОТОВЫХ ПРЕСЕТОВ */}
                        <div className="mb-4">
                            <label className="input-label mb-3">Preset Palette Catalog</label>
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
                                        {themeItem.isPremiumOnly && <span className="premium-lock-badge">Premium</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <hr className="border-secondary my-4" style={{ opacity: 0.05 }} />

                        {/* КОНСТРУКТОР ЛИЧНОГО ГРАДИЕНТА */}
                        <form onSubmit={handleSaveCustomTheme} className="premium-generator-layout flex-column align-items-stretch gap-4">
                            <label className="input-label mb-0">Custom Linear-Gradient Node Generator</label>

                            <div className="d-flex gap-4 align-items-center">
                                {/* Превью в реальном времени */}
                                <div
                                    className="gradient-preview-viewport flex-grow-1 rounded-3 p-3 d-flex align-items-fend"
                                    style={{ background: `linear-gradient(135deg, ${backgroundColor} 0%, ${secondaryColor} 50%, ${primaryColor} 100%)` }}
                                >
                                    <div className="viewport-inner-content">
                                        <span className="app-mock-title">Canvas Context</span>
                                        <span className="app-mock-subtitle">Live Rendering Engine</span>
                                    </div>
                                </div>

                                {/* Ползунки выбора HEX цветов */}
                                <div className="d-flex flex-column gap-2 flex-shrink-0">
                                    <div className="color-picker-node-row">
                                        <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                                        <span>Primary Node</span>
                                    </div>
                                    <div className="color-picker-node-row">
                                        <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
                                        <span>Middle Node</span>
                                    </div>
                                    <div className="color-picker-node-row">
                                        <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
                                        <span>Base Ground</span>
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex justify-content-end mt-2">
                                <button type="submit" className="yuviron-btn-minimal" disabled={isSavingCustom}>
                                    {isSavingCustom ? 'Deploying...' : 'Deploy Live Palette'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* ПЛАВАЮЩИЙ ТОСТ СПОВІЩЕННЯ */}
            {successMessage && (
                <div className="yuviron-alert alert-success-toast">
                    <i className="bi bi-check-circle-fill alert-icon" />
                    <div className="alert-content">{successMessage}</div>
                </div>
            )}
        </div>
    );
};