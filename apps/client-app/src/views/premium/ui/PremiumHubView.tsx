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

    // УКРАЇНІЗОВАНИЙ ЦІАНОВИЙ КИБЕР-ЛОАДЕР YUVIRON
    if (isUserLoading || isPlansLoading || isThemesLoading) {
        return (
            <div className="yuviron-loader-wrapper text-center py-5">
                <div className="cyber-spinner mb-3 mx-auto">
                    <div className="spinner-outer-ring" />
                    <div className="spinner-core-node" />
                </div>
                <div className="loader-diagnostic-text font-monospace small text-muted">Синхронізація платіжних вузлів...</div>
            </div>
        );
    }

    const triggerToast = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 4000);
    };

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

            const resBody = (response as any)?.data || response;
            const redirectUrl = resBody?.url || (typeof resBody === 'string' ? resBody : null);

            if (redirectUrl) {
                window.location.href = redirectUrl;
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
            triggerToast('Конфігурацію кольорової схеми успішно застосовано.');
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
            triggerToast('Ваш персональний шар кастомного градієнта успішно впроваджено.');
        } catch (err) {
            console.error('[Theme] Custom save failed:', err);
        } finally {
            setIsSavingCustom(false);
        }
    };

    const formatPeriod = (period?: string | null) => {
        if (period === PlanPeriod.Month) return 'місяць';
        if (period === PlanPeriod.Year) return 'рік';
        return 'період';
    };

    return (
        <div className="premium-hub-page-root">
            <div className="premium-hub-wrapper container py-5">

                {/* ГЕРОЙ-БАННЕР */}
                <header className="premium-hub-hero text-center mb-5 p-5 rounded-4">
                    <span className="hero-badge px-3 py-1 rounded-pill mb-2 d-inline-block">Yuviron Premium</span>
                    <h1 className="fw-black text-white display-5 mb-3 tracking-tight mt-2">
                        {isPremium ? 'Ласкаво просимо до Premium Студії' : 'Розблокуйте максимальну акустичну точність'}
                    </h1>
                    <div className="premium-hero-features mx-auto mt-4" style={{ maxWidth: '780px' }}>
                        <p className="text-secondary mb-4" style={{ fontSize: '15px', lineHeight: '1.6', color: '#b3b3cb' }}>
                            Виведіть свій досвід у Yuviron на новий рівень. З Premium ви отримуєте не лише професійні аудіо- та рендеринг-інструменти, а й абсолютний комфорт:
                        </p>

                        <div className="row g-3 text-start mt-2">
                            {/* Фіча 1 */}
                            <div className="col-12 col-md-4">
                                <div className="feature-mini-node p-3 rounded-3 h-100">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <i className="bi bi-person-lines-fill icon-vector" />
                                        <h6 className="fw-bold text-white mb-0">Керуйте ефективніше</h6>
                                    </div>
                                    <p className="small mb-0 text-muted-desc">
                                        Необмежена кількість артистів в одному інтерфейсі керування.
                                    </p>
                                </div>
                            </div>

                            {/* Фіча 2 */}
                            <div className="col-12 col-md-4">
                                <div className="feature-mini-node p-3 rounded-3 h-100">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <i className="bi bi-palette-fill icon-vector" />
                                        <h6 className="fw-bold text-white mb-0">Персоналізуйте простір</h6>
                                    </div>
                                    <p className="small mb-0 text-muted-desc">
                                        Динамічно змінюйте кольори фону та вектори тем клієнта.
                                    </p>
                                </div>
                            </div>

                            {/* Фіча 3 */}
                            <div className="col-12 col-md-4">
                                <div className="feature-mini-node p-3 rounded-3 h-100">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <i className="bi bi-eye-slash-fill icon-vector" />
                                        <h6 className="fw-bold text-white mb-0">Працюйте без обмежень</h6>
                                    </div>
                                    <p className="small mb-0 text-muted-desc">
                                        Жодної реклами чи сторонніх модулів — тільки ви та ваш контент.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* СІТКА ТАРИФІВ */}
                <section className="mb-5 py-2 pb-5 py-lg-4">
                    <h3 className="hub-section-title text-center mb-3 mb-lg-5 tracking-tight">Оберіть свій рівень Premium</h3>
                    <div className="plans-grid-system">
                        {plans.map((plan: PlanDto) => {
                            const isCurrentPlan = isPremium && plan.type === PlanType.Listener;
                            return (
                                <div
                                    key={plan.id}
                                    className={`plan-premium-card p-4 rounded-4 ${isCurrentPlan ? 'current-active-plan' : ''}`}
                                >
                                    <div className="card-top-details">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <h4 className="fw-bold text-white mb-0">{plan.name || 'Premium план'}</h4>
                                            {isCurrentPlan && <span className="current-badge">Активний</span>}
                                        </div>

                                        <div className="plan-price-tag my-3">
                                            <span className="price-amount text-white fw-black fs-2">{plan.price}</span>
                                            <span className="text-white-50 small"> {plan.currency || 'USD'} / {formatPeriod(plan.period)}</span>
                                        </div>

                                        <hr className="border-secondary my-3" style={{ opacity: 0.1 }} />
                                    </div>

                                    <div className="card-action-block mt-1">
                                        <button
                                            type="button"
                                            className={isCurrentPlan ? 'yuviron-btn-minimal py-2' : 'yuviron-btn-cosmic-glow py-2'}
                                            disabled={isCurrentPlan}
                                            onClick={() => handleSubscribe(plan.id)}
                                        >
                                            {isCurrentPlan ? 'Поточний тариф' : 'Оновити профіль'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>


                {/* ТОСТ НА ПОВЕРХНІ */}
                {successMessage && (
                    <div className="position-fixed bottom-0 end-0 m-4 p-3 rounded-3 shadow-lg border border-success bg-dark text-success" style={{ zIndex: 1100 }}>
                        <span className="small fw-semibold">✓ {successMessage}</span>
                    </div>
                )}
            </div>
        </div>
    );
};