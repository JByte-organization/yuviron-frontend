'use client';

import React, { useState } from 'react';
import { useGetApiPlans, type PlanDto } from '@repo/api/client.ts';
import {
    usePostApiStudioArtistPaymentsArtistCheckout,
    usePostApiStudioArtistPaymentsCancel,
} from '@repo/api/artist.ts';
import { useCurrentArtist } from '@/entities/artist/model/currentArtist';
import { useArtistPermissions } from '@/entities/artist/model/useArtistPermissions';
import { ChartSkeleton } from '@/entities/artist/ui/AnalyticsChartParts';
import { unwrap, unwrapList } from '@/shared/lib/unwrapApi';

const PERIOD_LABEL: Record<string, string> = {
    Month: 'місяць',
    Year: 'рік',
    Unknown: '',
};
const periodLabel = (p?: string | null) => (p ? PERIOD_LABEL[p] ?? p.toLowerCase() : '');

export const ArtistSubscriptionPage = () => {
    const { artistId } = useCurrentArtist();
    const { can, lockTitle } = useArtistPermissions();
    const canBill = can('finance');

    const { data: plansRaw, isLoading } = useGetApiPlans();
    // Тільки артист-плани (лістенер-преміум — окремий екран колеги).
    const plans = unwrapList<PlanDto>(plansRaw).filter((p) => p.type === 'Artist');

    const { mutateAsync: checkout, isPending: isCheckingOut } =
        usePostApiStudioArtistPaymentsArtistCheckout();
    const { mutateAsync: cancel, isPending: isCancelling } =
        usePostApiStudioArtistPaymentsCancel();

    const [busyPlanId, setBusyPlanId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    // Stripe-редірект: бек повертає URL рядком, ведемо туди браузер. Success/cancel
    // повертають назад на цей екран.
    const returnUrls = () => {
        const base = typeof window !== 'undefined' ? window.location.origin : '';
        return {
            successUrl: `${base}/artist-dashboard/subscription?status=success`,
            cancelUrl: `${base}/artist-dashboard/subscription?status=cancel`,
        };
    };

    const handleSubscribe = async (planId: string | undefined) => {
        if (!artistId || !planId) return;
        setError(null);
        setBusyPlanId(planId);
        try {
            const url = unwrap<string>(
                await checkout({ data: { artistId, planId, ...returnUrls() } }),
            );
            if (url) window.location.href = url;
            else setError('Не вдалося отримати посилання на оплату. Спробуйте ще раз.');
        } catch {
            setError('Не вдалося розпочати оплату. Спробуйте ще раз пізніше.');
        } finally {
            setBusyPlanId(null);
        }
    };

    const handleCancel = async () => {
        if (!artistId) return;
        setError(null);
        setNotice(null);
        try {
            await cancel({ data: { artistId } });
            setNotice('Підписку скасовано. Доступ збережеться до кінця оплаченого періоду.');
        } catch {
            setError('Не вдалося скасувати підписку. Можливо, активної підписки немає.');
        }
    };

    return (
        <div className="artist-analytics-page">
            <div className="artist-analytics-page__header">
                <h1 className="artist-analytics-page__title">Підписка артиста</h1>
            </div>

            {!canBill ? (
                <div className="artist-analytics-page__chart-block">
                    <div className="text-secondary py-4 text-center">
                        <i className="bi bi-lock me-2" />
                        {lockTitle}
                    </div>
                </div>
            ) : (
                <>
                    {error && <div className="client-modal__field-error mb-3">{error}</div>}
                    {notice && (
                        <div className="mb-3" style={{ color: '#2ECC71', fontSize: 13 }}>
                            {notice}
                        </div>
                    )}

                    <div className="artist-analytics-page__chart-block mb-4">
                        <h2 className="artist-analytics-page__chart-title">Тарифні плани</h2>

                        {isLoading ? (
                            <ChartSkeleton height={160} />
                        ) : plans.length === 0 ? (
                            <div className="text-secondary py-4 text-center">
                                Наразі немає доступних планів для артистів.
                            </div>
                        ) : (
                            <div className="row g-3 mt-1">
                                {plans.map((plan) => (
                                    <div key={plan.id} className="col-12 col-md-6">
                                        <div className="artist-analytics-page__top-track h-100 d-flex flex-column align-items-start">
                                            <h3 className="artist-analytics-page__top-track-title mb-1">
                                                {plan.name ?? 'План'}
                                            </h3>
                                            <div className="mb-3" style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>
                                                {plan.price}
                                                <span className="text-secondary ms-1" style={{ fontSize: 13, fontWeight: 400 }}>
                                                    {plan.currency ?? ''}
                                                    {periodLabel(plan.period) ? ` / ${periodLabel(plan.period)}` : ''}
                                                </span>
                                            </div>
                                            <button
                                                className="client-modal__btn client-modal__btn--primary w-100 mt-auto"
                                                disabled={isCheckingOut && busyPlanId === plan.id}
                                                onClick={() => handleSubscribe(plan.id)}
                                            >
                                                {isCheckingOut && busyPlanId === plan.id
                                                    ? 'Переходимо до оплати…'
                                                    : 'Оформити'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="artist-analytics-page__chart-block">
                        <h2 className="artist-analytics-page__chart-title">Керування підпискою</h2>
                        <p className="text-secondary mt-2 mb-3" style={{ fontSize: 13 }}>
                            Скасування зупиняє автопродовження. Доступ зберігається до кінця
                            оплаченого періоду.
                        </p>
                        <button
                            className="client-modal__btn client-modal__btn--ghost"
                            disabled={isCancelling}
                            onClick={handleCancel}
                        >
                            {isCancelling ? 'Скасовуємо…' : 'Скасувати підписку'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
