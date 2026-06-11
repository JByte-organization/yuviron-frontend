'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { uk } from 'date-fns/locale';
import {
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer,
} from 'recharts';
import {
    AppPermission,
    PayoutMethod,
    WalletTransactionType,
    getGetApiStudioArtistFinancePayoutsQueryKey,
    getGetApiStudioArtistFinanceSettingsQueryKey,
    getGetApiStudioArtistFinanceTransactionsQueryKey,
    getGetApiStudioArtistFinanceWalletQueryKey,
    useGetApiStudioArtistFinancePayouts,
    useGetApiStudioArtistFinanceSettings,
    useGetApiStudioArtistFinanceTransactions,
    useGetApiStudioArtistFinanceWallet,
    usePostApiStudioArtistFinancePayouts,
    usePostApiStudioArtistFinanceSettings,
    type ArtistPayoutRequestDto,
    type ArtistWalletDto,
    type PayoutSettingsDto,
    type WalletTransactionDto,
} from '@repo/api/artist.ts';
import { useCurrentArtist } from '@/entities/artist/model/currentArtist';
import {
    CHART_COLORS,
    ChartError,
    ChartSkeleton,
    chartTooltipStyle,
    useChartAxisColors,
} from '@/entities/artist/ui/AnalyticsChartParts';
import { Confetti } from '@/shared/ui/Confetti';
import { useFinanceRealtime } from '@/entities/artist/model/useFinanceRealtime';

const unwrap = <T,>(raw: unknown): T | undefined => {
    if (!raw) return undefined;
    const obj = raw as { data?: T };
    return (obj.data ?? (raw as T)) as T;
};

const unwrapItems = <T,>(raw: unknown): T[] => {
    if (!raw) return [];
    const obj = raw as { items?: T[]; data?: { items?: T[] } };
    return obj.items ?? obj.data?.items ?? [];
};

const money = (value: number | undefined): string =>
    (value ?? 0).toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const dateTime = (iso: string | undefined): string =>
    iso ? format(parseISO(iso), 'dd.MM.yyyy HH:mm') : '—';

// Достаём человекочитаемое сообщение из ответа сервера (ProblemDetails.detail/title)
// или из сырого текста — для тоста на 400 ("Сума менша за мінімальну" и т.п.).
const serverMessage = (error: unknown): string | null => {
    const data = (error as { response?: { data?: unknown } } | null)?.response?.data;
    if (!data) return null;
    if (typeof data === 'string') return data;
    const d = data as { detail?: string; title?: string; rawText?: string };
    return d.detail ?? d.title ?? d.rawText ?? null;
};

// PayoutMethod у живому свагері — рядковий enum PayPal|Stripe|BankTransfer (бек
// замінив старі int 1|2|3). Ключі = значення, які приймає бек; типізуємо як
// Record<string,…>, щоб код компілювався і зі старим int-enum у закоміченому
// fallback (CI генерує з живого — рядки), і не залежав від типу PayoutMethod.
const PAYOUT_METHOD_LABELS: Record<string, string> = {
    PayPal: 'PayPal',
    Stripe: 'Stripe (картка)',
    BankTransfer: 'Банківський переказ (IBAN)',
};

const TRANSACTION_LABELS: Record<string, string> = {
    RoyaltyAccrual:   'Нарахування роялті',
    PayoutReserved:   'Резерв під виплату',
    PayoutReleased:   'Повернення резерву',
    PayoutCompleted:  'Виплату виконано',
    ManualAdjustment: 'Коригування',
};

const PAYOUT_STATUS: Record<string, { label: string; color: string }> = {
    Pending:  { label: 'Очікує',    color: '#FFB347' },
    Approved: { label: 'Схвалено',  color: '#00A6FF' },
    Rejected: { label: 'Відхилено', color: '#FF6B6B' },
    Paid:     { label: 'Виплачено', color: '#2ECC71' },
    Unknown:  { label: '—',         color: '#9AA7B8' },
};

export const ArtistFinancePage = () => {
    const { artistId, canManage } = useCurrentArtist();
    const queryClient = useQueryClient();
    const chart = useChartAxisColors();

    // ─── Запити ─────────────────────────────────────────
    const walletParams = { artistId: artistId ?? undefined };
    const walletKey = getGetApiStudioArtistFinanceWalletQueryKey(walletParams);
    const walletQuery = useGetApiStudioArtistFinanceWallet(walletParams, {
        query: { enabled: !!artistId, queryKey: walletKey },
    });
    const wallet = unwrap<ArtistWalletDto>(walletQuery.data);

    const settingsParams = { artistId: artistId ?? undefined };
    const settingsQuery = useGetApiStudioArtistFinanceSettings(settingsParams, {
        query: { enabled: !!artistId, queryKey: getGetApiStudioArtistFinanceSettingsQueryKey(settingsParams) },
    });
    const settings = unwrap<PayoutSettingsDto>(settingsQuery.data);
    // Реквізити збережені, лише якщо заповнено accountDetails (бек віддає порожній
    // DTO/ null, поки артист не вказав рахунок). Без них виплата заблокована.
    const hasSettings = !!settings?.accountDetails;

    // PageSize побільше — щоб вистачило точок для графіка доходів (бек пагінує).
    const txParams = { ArtistId: artistId ?? undefined, Page: 1, PageSize: 100 };
    const txQuery = useGetApiStudioArtistFinanceTransactions(txParams, {
        query: { enabled: !!artistId, queryKey: getGetApiStudioArtistFinanceTransactionsQueryKey(txParams) },
    });
    const transactions = unwrapItems<WalletTransactionDto>(txQuery.data);

    const payoutsParams = { ArtistId: artistId ?? undefined, Page: 1, PageSize: 20 };
    const payoutsQuery = useGetApiStudioArtistFinancePayouts(payoutsParams, {
        query: { enabled: !!artistId, queryKey: getGetApiStudioArtistFinancePayoutsQueryKey(payoutsParams) },
    });
    const payouts = unwrapItems<ArtistPayoutRequestDto>(payoutsQuery.data);

    // ─── Дані графіка доходів ───────────────────────────
    // Беремо лише RoyaltyAccrual, групуємо по днях: X = день, Y = сума роялті.
    const revenueData = React.useMemo(() => {
        const byDay = new Map<string, number>();
        for (const tx of transactions) {
            if (tx.type !== WalletTransactionType.RoyaltyAccrual || !tx.createdAt) continue;
            const day = format(parseISO(tx.createdAt), 'yyyy-MM-dd');
            byDay.set(day, (byDay.get(day) ?? 0) + (tx.amount ?? 0));
        }
        return Array.from(byDay.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([day, amount]) => ({
                label: format(parseISO(day), 'dd MMM', { locale: uk }),
                amount: Number(amount.toFixed(2)),
            }));
    }, [transactions]);

    // ─── Тост + конфетті ────────────────────────────────
    const [toast, setToast] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
    const [confettiKey, setConfettiKey] = useState(0);
    const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const confettiTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = React.useCallback((kind: 'ok' | 'error', text: string) => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ kind, text });
        toastTimer.current = setTimeout(() => setToast(null), 5000);
    }, []);

    const fireConfetti = React.useCallback(() => {
        if (confettiTimer.current) clearTimeout(confettiTimer.current);
        setConfettiKey(k => k + 1);
        confettiTimer.current = setTimeout(() => setConfettiKey(0), 3500);
    }, []);

    React.useEffect(() => () => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        if (confettiTimer.current) clearTimeout(confettiTimer.current);
    }, []);

    // ─── Realtime (SignalR): рефреш кошелька на події біллінгу ──
    // payout_approved → зелений тост + фоновий рефреш; first_royalties → конфетті.
    useFinanceRealtime({
        onPayoutApproved: () => showToast('ok', 'Виплату схвалено — гроші в дорозі! 🎉'),
        onFirstRoyalties: () => { fireConfetti(); showToast('ok', 'Перші роялті зараховано! 🎉'); },
    });

    // ─── Запит виплати ──────────────────────────────────
    const [amount, setAmount] = useState('');
    const { mutateAsync: requestPayout, isPending: isRequesting } = usePostApiStudioArtistFinancePayouts();

    const available = wallet?.availableBalance ?? 0;
    const amountNum = Number(amount.replace(',', '.'));
    const amountValid = Number.isFinite(amountNum) && amountNum > 0 && amountNum <= available;

    const submitPayout = async () => {
        if (!artistId || !amountValid || !hasSettings) return;

        // Оптимістично: одразу віднімаємо з «Доступно» і додаємо в «Резерв» —
        // не чекаємо сервер (doc). На помилці відкочуємо знімок назад.
        const prevWallet = queryClient.getQueryData<ArtistWalletDto>(walletKey);
        queryClient.setQueryData<ArtistWalletDto>(walletKey, old =>
            old
                ? {
                    ...old,
                    availableBalance: (old.availableBalance ?? 0) - amountNum,
                    heldBalance: (old.heldBalance ?? 0) + amountNum,
                }
                : old,
        );

        try {
            await requestPayout({
                data: {
                    artistId,
                    amount: amountNum,
                    requiredPermission: AppPermission.StudioArtistManage,
                },
            });
            setAmount('');
            fireConfetti();
            showToast('ok', 'Запит на виплату створено — очікуйте на рішення.');
            // Узгоджуємо локальний стан із сервером.
            await queryClient.invalidateQueries({ queryKey: ['/api/studio-artist/finance/wallet'] });
            await queryClient.invalidateQueries({ queryKey: ['/api/studio-artist/finance/payouts'] });
            await queryClient.invalidateQueries({ queryKey: ['/api/studio-artist/finance/transactions'] });
        } catch (err) {
            queryClient.setQueryData<ArtistWalletDto>(walletKey, prevWallet); // rollback
            showToast('error', serverMessage(err) ?? 'Не вдалося створити запит на виплату.');
        }
    };

    // ─── Налаштування виплат ────────────────────────────
    const [method, setMethod] = useState<string>('PayPal');
    const [accountDetails, setAccountDetails] = useState('');
    const [settingsError, setSettingsError] = useState<string | null>(null);
    const [settingsOk, setSettingsOk] = useState(false);
    const { mutateAsync: saveSettings, isPending: isSavingSettings } = usePostApiStudioArtistFinanceSettings();

    // Prefill після завантаження поточних налаштувань — синхронізація стану
    // прямо під час рендера (react.dev/learn/you-might-not-need-an-effect).
    const [syncedSettings, setSyncedSettings] = useState<PayoutSettingsDto | undefined>(undefined);
    if (settings && settings !== syncedSettings) {
        setSyncedSettings(settings);
        if (settings.method) setMethod(String(settings.method));
        setAccountDetails(settings.accountDetails ?? '');
    }

    const submitSettings = async () => {
        if (!artistId) return;
        setSettingsOk(false);
        try {
            await saveSettings({
                data: {
                    artistId,
                    // method тримаємо як рядок (значення живого enum); каст через
                    // unknown — щоб компілювалось і зі старим int-enum у fallback.
                    method: method as unknown as PayoutMethod,
                    accountDetails: accountDetails.trim(),
                    requiredPermission: AppPermission.StudioArtistManage,
                },
            });
            setSettingsOk(true);
            await queryClient.invalidateQueries({ queryKey: ['/api/studio-artist/finance/settings'] });
        } catch (err) {
            showToast('error', serverMessage(err) ?? 'Не вдалося зберегти налаштування виплат.');
        }
    };

    return (
        <div className="artist-analytics-page">

            {confettiKey > 0 && <Confetti key={confettiKey} seed={confettiKey} />}

            {/* ─── Заголовок ────────────────────────── */}
            <div className="artist-analytics-page__header">
                <h1 className="artist-analytics-page__title">Фінанси</h1>
            </div>

            {/* ─── Баланси ───────────────────────────── */}
            {walletQuery.isLoading ? (
                <ChartSkeleton height={120} />
            ) : walletQuery.isError ? (
                <ChartError error={walletQuery.error} />
            ) : (
                <div className="row g-3 mb-5">
                    {[
                        { label: 'Доступно до виплати', value: money(wallet?.availableBalance), icon: 'bi-wallet2',     color: '#2ECC71' },
                        { label: 'У резерві',           value: money(wallet?.heldBalance),      icon: 'bi-hourglass',   color: '#FFB347' },
                        { label: 'Зароблено всього',    value: money(wallet?.totalEarned),      icon: 'bi-cash-stack',  color: '#00A6FF' },
                    ].map(card => (
                        <div key={card.label} className="col-12 col-md-4">
                            <div className="artist-analytics-page__card">
                                <div className="artist-analytics-page__card-icon" style={{ color: card.color }}>
                                    <i className={`bi ${card.icon}`} />
                                </div>
                                <div className="artist-analytics-page__card-value">{card.value}</div>
                                <div className="artist-analytics-page__card-label">{card.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {canManage && (
            <div className="row g-4 mb-5">
                {/* ─── Запит на виплату ───────────────── */}
                <div className="col-12 col-lg-6">
                    <div className="artist-analytics-page__chart-block h-100">
                        <h2 className="artist-analytics-page__chart-title">Запит на виплату</h2>
                        <div className="mt-3">
                            <label className="artist-settings-page__field-label">
                                Сума (доступно: {money(available)})
                            </label>
                            <input
                                type="number"
                                min={0}
                                step="0.01"
                                className="client-modal__input"
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                            />
                            {amount && !amountValid && (
                                <div className="client-modal__field-error mt-1">
                                    Сума має бути більшою за 0 і не перевищувати доступний баланс.
                                </div>
                            )}
                            {!hasSettings && !settingsQuery.isLoading && (
                                <div className="mt-1" style={{ color: '#FFB347', fontSize: 13 }}>
                                    Спочатку вкажіть реквізити виплати →
                                </div>
                            )}
                            {/* span-обгортка тримає тултип навіть на disabled-кнопці */}
                            <span title={!hasSettings ? 'Спочатку вкажіть реквізити' : undefined} className="d-inline-block mt-3">
                                <button
                                    className="client-modal__btn client-modal__btn--primary"
                                    disabled={!hasSettings || !amountValid || isRequesting}
                                    onClick={submitPayout}
                                >
                                    {isRequesting ? 'Надсилаємо…' : 'Вивести кошти'}
                                </button>
                            </span>
                        </div>
                    </div>
                </div>

                {/* ─── Налаштування виплат ────────────── */}
                <div className="col-12 col-lg-6">
                    <div className="artist-analytics-page__chart-block h-100">
                        <h2 className="artist-analytics-page__chart-title">Реквізити виплат</h2>
                        {settingsQuery.isLoading ? (
                            <ChartSkeleton height={120} />
                        ) : (
                            <div className="mt-3">
                                <label className="artist-settings-page__field-label">Спосіб виплати</label>
                                <select
                                    className="client-modal__input"
                                    value={method}
                                    onChange={e => { setMethod(e.target.value); setSettingsOk(false); }}
                                >
                                    {Object.entries(PAYOUT_METHOD_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>

                                <label className="artist-settings-page__field-label mt-3">Реквізити</label>
                                <input
                                    type="text"
                                    className="client-modal__input"
                                    placeholder="Номер картки / email / IBAN"
                                    value={accountDetails}
                                    onChange={e => { setAccountDetails(e.target.value); setSettingsOk(false); }}
                                />

                                {settingsOk && (
                                    <div className="mt-1" style={{ color: '#2ECC71', fontSize: 13 }}>
                                        Збережено.
                                    </div>
                                )}
                                <button
                                    className="client-modal__btn client-modal__btn--primary mt-3"
                                    disabled={isSavingSettings || !accountDetails.trim()}
                                    onClick={submitSettings}
                                >
                                    {isSavingSettings ? 'Зберігаємо…' : 'Зберегти'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            )}

            {/* ─── Графік доходів ────────────────────── */}
            <div className="artist-analytics-page__chart-block mb-5">
                <h2 className="artist-analytics-page__chart-title">Динаміка доходів (роялті)</h2>
                {txQuery.isLoading ? (
                    <ChartSkeleton />
                ) : txQuery.isError ? (
                    <ChartError error={txQuery.error} />
                ) : revenueData.length === 0 ? (
                    <div className="text-secondary py-4 text-center">
                        Поки немає нарахувань роялті — графік з’явиться після першої виплати від платформи.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                            <XAxis dataKey="label" tick={{ fill: chart.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: chart.text, fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                {...chartTooltipStyle}
                                formatter={(value) => [`${money(Number(value))}`, 'Роялті']}
                            />
                            <Bar dataKey="amount" name="Роялті" fill={CHART_COLORS.accent} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* ─── Заявки на виплату ─────────────────── */}
            <div className="artist-analytics-page__chart-block mb-5">
                <h2 className="artist-analytics-page__chart-title">Запити на вивід</h2>
                {payoutsQuery.isLoading ? (
                    <ChartSkeleton height={120} />
                ) : payoutsQuery.isError ? (
                    <ChartError error={payoutsQuery.error} />
                ) : payouts.length === 0 ? (
                    <div className="text-secondary py-4 text-center">Заявок ще не було.</div>
                ) : (
                    <div className="d-flex flex-column gap-2 mt-3">
                        {payouts.map(p => {
                            const status = PAYOUT_STATUS[p.status ?? 'Unknown'] ?? PAYOUT_STATUS.Unknown!;
                            return (
                                <div key={p.id} className="artist-analytics-page__top-track">
                                    <span className="artist-analytics-page__top-track-title">
                                        {money(p.requestedAmount)}
                                    </span>
                                    <span style={{ color: status.color, fontSize: 13, fontWeight: 600 }}>
                                        {status.label}
                                    </span>
                                    {p.decisionNote && (
                                        <i
                                            className="bi bi-info-circle"
                                            title={p.decisionNote}
                                            style={{ color: '#9AA7B8', cursor: 'help' }}
                                        />
                                    )}
                                    <span className="artist-analytics-page__top-track-plays ms-auto">
                                        {dateTime(p.requestedAt)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ─── Транзакції ────────────────────────── */}
            <div className="artist-analytics-page__chart-block">
                <h2 className="artist-analytics-page__chart-title">Історія транзакцій</h2>
                {txQuery.isLoading ? (
                    <ChartSkeleton height={160} />
                ) : txQuery.isError ? (
                    <ChartError error={txQuery.error} />
                ) : transactions.length === 0 ? (
                    <div className="text-secondary py-4 text-center">Транзакцій ще немає.</div>
                ) : (
                    <div className="d-flex flex-column gap-2 mt-3">
                        {transactions.map(tx => {
                            const negative = (tx.amount ?? 0) < 0;
                            return (
                                <div key={tx.id} className="artist-analytics-page__top-track">
                                    <span
                                        style={{
                                            color: negative ? '#FF6B6B' : '#2ECC71',
                                            fontWeight: 700,
                                            minWidth: 90,
                                        }}
                                    >
                                        {negative ? '' : '+'}{money(tx.amount)}
                                    </span>
                                    <span className="artist-analytics-page__top-track-title">
                                        {TRANSACTION_LABELS[tx.type ?? ''] ?? tx.type ?? 'Транзакція'}
                                        {tx.description ? ` — ${tx.description}` : ''}
                                    </span>
                                    <span className="artist-analytics-page__top-track-plays ms-auto">
                                        {dateTime(tx.createdAt)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ─── Тост (успіх / помилка) ────────────── */}
            {toast && (
                <div
                    role="status"
                    style={{
                        position: 'fixed',
                        bottom: 24,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10000,
                        maxWidth: 440,
                        padding: '12px 18px',
                        borderRadius: 10,
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                        boxShadow: '0 8px 24px rgba(0,0,0,.35)',
                        background: toast.kind === 'ok' ? '#2ECC71' : '#FF6B6B',
                    }}
                >
                    {toast.text}
                </div>
            )}

        </div>
    );
};
