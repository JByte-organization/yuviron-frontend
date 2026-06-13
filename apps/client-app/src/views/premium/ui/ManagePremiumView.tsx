'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
    useGetApiAuthMe,
    useGetApiPaymentsHistory,
    usePostApiPaymentsCancel,
    getGetApiPaymentsHistoryQueryKey,
    getGetApiAuthMeQueryKey,
    type CurrentUserDto,
    type BillingInvoiceDto
} from '@repo/api/client';

export const ManagePremiumView = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    // ─── Запросы данных с сервера ───────────────────────────
    const { data: meRaw, isLoading: isUserLoading } = useGetApiAuthMe();
    const me = (meRaw as CurrentUserDto) ?? null;

    const { data: historyRaw, isLoading: isHistoryLoading } = useGetApiPaymentsHistory();
    const invoices: BillingInvoiceDto[] = (historyRaw as any)?.data ?? [];

    // ─── Мутация скачивания автопродления ─────────────────
    const { mutateAsync: cancelSubscription, isPending: isCancelling } = usePostApiPaymentsCancel();

    // ─── Стейты интерактива и загрузки ────────────────────
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isEntering, setIsEntering] = useState(true);

    useEffect(() => {
        const loaderTimer = setTimeout(() => {
            setIsEntering(false);
        }, 750);
        return () => clearTimeout(loaderTimer);
    }, []);

    if (isUserLoading || isHistoryLoading || isEntering) {
        return (
            <div className="yuviron-loader-wrapper">
                <div className="cyber-spinner">
                    <div className="spinner-outer-ring" />
                    <div className="spinner-core-node" />
                </div>
                <span className="loader-diagnostic-text">Decrypting secure billing layer...</span>
            </div>
        );
    }

    if (!me?.isPremium) {
        router.push('/premium');
        return null;
    }

    const latestInvoice = invoices[0];

    const triggerToast = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 4000);
    };

    const executeCancelSubscription = async () => {
        setIsCancelModalOpen(false);
        try {
            await cancelSubscription();
            await queryClient.invalidateQueries({ queryKey: getGetApiAuthMeQueryKey() });
            await queryClient.invalidateQueries({ queryKey: getGetApiPaymentsHistoryQueryKey() });
            triggerToast('Auto-renewal successfully deactivated.');
        } catch (err) {
            console.error('[Billing] Cancellation failed:', err);
        }
    };

    return (
        <div className="manage-premium-view py-5 animate-fade-in">
            <div className="container-lg">
                <header className="manage-header text-start mb-5">
                    <span className="premium-micro-headline mb-2">Billing Dashboard</span>
                    <h1 className="fw-black text-white display-6 tracking-tight">Subscription plan</h1>
                    <p className="text-muted-custom small mt-1">Review your automated billing metrics, access cycles and verified payment receipts.</p>
                </header>

                <div className="row g-5 dashboard-grid-layout">
                    {/* ЛЕВАЯ СЕКЦИЯ: ТЕКУЩИЙ СТАТУС */}
                    <div className="col-12 col-lg-5">
                        <div className="billing-status-container d-flex flex-column justify-content-between h-100">
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="tier-badge-pill">Premium Layer Active</span>
                                    <div className="shield-icon-glow">
                                        <i className="bi bi-shield-check" />
                                    </div>
                                </div>

                                <h2 className="display-title text-white fw-black mt-3 mb-1">Yuviron Pass</h2>
                                <p className="text-muted-custom small-desc">Unrestricted studio privileges and high-fidelity spatial decoding enabled.</p>

                                <div className="diagnostic-metrics-list d-flex flex-column gap-2 mt-4">
                                    <div className="metric-row-item d-flex justify-content-between">
                                        <span className="m-label">Pricing Rate</span>
                                        <span className="m-value text-white font-monospace">
                                        ${latestInvoice?.amountPaid ?? '9.99'} <span className="currency-type">{latestInvoice?.currency?.toUpperCase() || 'USD'}</span>
                                    </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-5">
                                <button
                                    type="button"
                                    className="yuviron-btn-danger-minimal w-100 py-2.5 rounded-pill"
                                    onClick={() => setIsCancelModalOpen(true)}
                                >
                                    Cancel Subscription
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ПРАВАЯ СЕКЦИЯ: ИСТОРИЯ ТРАНЗАКЦИЙ */}
                    <div className="col-12 col-lg-7">
                        <div className="invoice-history-container h-100">
                            <h4 className="card-inner-caption mb-4">Receipt History</h4>

                            {invoices.length === 0 ? (
                                <div className="empty-history-placeholder p-5 text-center text-secondary rounded-4">
                                    <i className="bi bi-wallet2 d-block mb-2 fs-4 opacity-40" />
                                    No processed billing events discovered.
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-custom align-middle mb-0">
                                        <thead>
                                        <tr>
                                            <th className="fw-bold">Status</th>
                                            <th className="fw-bold">Invoice Reference</th>
                                            <th className="fw-bold text-end">Amount</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {invoices.map((invoice: BillingInvoiceDto) => {
                                            const isPaid = invoice.status?.toLowerCase() === 'paid';
                                            return (
                                                <tr key={invoice.id || Math.random().toString()}>
                                                    <td>
                                                        <span className={`status-capsule-badge ${isPaid ? 'is-paid' : 'is-pending'}`}>
                                                            {invoice.status || 'Processed'}
                                                        </span>
                                                    </td>
                                                    <td className="font-monospace text-secondary-custom">
                                                        {invoice.id ? `#${invoice.id.substring(0, 8)}...` : 'N/A'}
                                                    </td>
                                                    <td className="text-white text-end fw-bold font-monospace">
                                                        <div className="d-inline-flex align-items-center gap-2">
                                                            {invoice.hostedInvoiceUrl && (
                                                                <a
                                                                    href={invoice.hostedInvoiceUrl}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="stripe-receipt-link-icon"
                                                                    title="View verified receipt"
                                                                >
                                                                    <i className="bi bi-arrow-up-right-circle" />
                                                                </a>
                                                            )}
                                                            <span>${invoice.amountPaid}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isCancelModalOpen && (
                    <div className="yuviron-modal-overlay">
                        <div className="yuviron-modal-card animate-fade-in">
                            <div className="modal-card-header text-center mb-3">
                                <div className="modal-danger-icon-badge mb-3">
                                    <i className="bi bi-exclamation-triangle-fill" />
                                </div>
                                <h5 className="fw-bold text-white mb-2">Cancel Premium?</h5>
                                <p className="text-secondary small px-2">
                                    You will instantly lose access to lossless compression audio, color node generators, and custom layout presets at the end of your billing cycle.
                                </p>
                            </div>

                            <div className="d-flex flex-column gap-2 mt-4">
                                <button
                                    type="button"
                                    className="yuviron-btn-danger-minimal w-100 py-2.5"
                                    onClick={executeCancelSubscription}
                                    disabled={isCancelling}
                                >
                                    {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
                                </button>
                                <button
                                    type="button"
                                    className="yuviron-btn-subtle w-100 py-2.5"
                                    onClick={() => setIsCancelModalOpen(false)}
                                >
                                    Keep Premium
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ТОСТ УВЕДОМЛЕНИЙ */}
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