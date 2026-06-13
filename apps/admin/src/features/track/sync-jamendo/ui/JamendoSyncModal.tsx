'use client';

import React, { useState } from 'react';
import { usePostApiAdminJamendoSync } from '@repo/api/admin.ts';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export const JamendoSyncModal = ({ isOpen, onClose }: Props) => {
    const [limit, setLimit] = useState<number>(20);
    const [offset, setOffset] = useState<number>(0);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Инициализируем мутацию из обновленного контракта Orval
    const { mutateAsync: syncTracks, isPending } = usePostApiAdminJamendoSync();

    const handleClose = () => {
        setIsSuccess(false);
        setError(null);
        onClose();
    };

    const handleSync = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSuccess(false);

        try {
            // Вызываем мутацию согласно новому контракту
            const res = await syncTracks({
                params: {
                    limit,
                    offset
                }
            });

            // Проверяем статус ответа (202 Accepted означает успешный запуск фоновой задачи)
            if (res.status === 202) {
                setIsSuccess(true);
            } else {
                setError('Jamendo node responded with an unexpected status layer.');
            }
        } catch {
            setError('Failed to establish connection with Jamendo synchronizer pipeline.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-sm" style={{ maxWidth: '400px' }}>
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">
                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold text-cyan d-flex align-items-center gap-2">
                            <i className="bi bi-cloud-arrow-down-fill" />
                            Jamendo Track Sync
                        </h5>
                        <button type="button" className="btn-close btn-close-white" onClick={handleClose} disabled={isPending} />
                    </div>

                    <form onSubmit={handleSync}>
                        <div className="modal-body p-4 d-flex flex-column gap-3">
                            {error && <div className="alert alert-danger py-2 small">{error}</div>}

                            {/* Новое сообщение об успешном фоновом запуске */}
                            {isSuccess && (
                                <div className="p-3 rounded bg-dark border border-success border-opacity-25 text-center mb-1">
                                    <i className="bi bi-check-circle-fill text-success fs-3 d-block mb-2" />
                                    <h6 className="fw-bold text-white mb-1">Sync Ingest Task Created</h6>
                                    <span className="small text-secondary d-block lh-sm mt-1">
                                        The core server accepted the operation (<strong className="text-cyan">HTTP 202</strong>). Tracks compilation is now deploying in a background queue context.
                                    </span>
                                </div>
                            )}

                            {/* Поля ввода параметров */}
                            <div>
                                <label className="form-label text-secondary small fw-bold" style={{ fontSize: '11px' }}>
                                    TRACKS IMPORT LIMIT (MAX)
                                </label>
                                <input
                                    type="number"
                                    className="form-control admin-login__input font-monospace"
                                    min={1}
                                    max={100}
                                    value={limit}
                                    disabled={isPending || isSuccess}
                                    onChange={(e) => setLimit(Number(e.target.value))}
                                    required
                                />
                                <div className="form-text text-muted" style={{ fontSize: '11px' }}>
                                    Recommended safe batch size: 20–50 tracks per pool session.
                                </div>
                            </div>

                            <div>
                                <label className="form-label text-secondary small fw-bold" style={{ fontSize: '11px' }}>
                                    CATALOG REPOSITORY OFFSET
                                </label>
                                <input
                                    type="number"
                                    className="form-control admin-login__input font-monospace"
                                    min={0}
                                    value={offset}
                                    disabled={isPending || isSuccess}
                                    onChange={(e) => setOffset(Number(e.target.value))}
                                    required
                                />
                            </div>
                        </div>

                        <div className="modal-footer border-0 p-4 pt-2">
                            <button type="button" className="btn btn-admin-dark px-4" onClick={handleClose} disabled={isPending}>
                                {isSuccess ? 'Close' : 'Cancel'}
                            </button>
                            {!isSuccess && (
                                <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={isPending}>
                                    {isPending ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Syncing...
                                        </>
                                    ) : (
                                        'Start Sync'
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};