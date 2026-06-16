'use client';

import React from 'react';
import Link from 'next/link';

interface PremiumGateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PremiumGateModal = ({ isOpen, onClose }: PremiumGateModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="premium-gate-modal-overlay" onClick={onClose}>
            <div className="premium-gate-modal" onClick={(e) => e.stopPropagation()}>
                <button className="premium-gate-modal__close" onClick={onClose} aria-label="Закрити">
                    <i className="bi bi-x-lg" />
                </button>

                <div className="premium-gate-modal__icon">
                    <i className="bi bi-stars" />
                </div>

                <h3 className="premium-gate-modal__title">Створіть акаунт артиста</h3>

                <p className="premium-gate-modal__text">
                    Кабінет артиста доступний із підпискою Premium. Оформіть Premium,
                    щоб завантажувати треки, бачити аналітику та отримувати виплати.
                </p>

                <div className="premium-gate-modal__actions">
                    <Link
                        href="/premium"
                        className="premium-gate-modal__btn premium-gate-modal__btn--primary"
                        onClick={onClose}
                    >
                        Перейти на Premium
                    </Link>
                    <button
                        type="button"
                        className="premium-gate-modal__btn premium-gate-modal__btn--ghost"
                        onClick={onClose}
                    >
                        Пізніше
                    </button>
                </div>
            </div>
        </div>
    );
};
