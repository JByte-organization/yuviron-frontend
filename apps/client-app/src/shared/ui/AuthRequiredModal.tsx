'use client';

import React from 'react';
import Link from 'next/link';

// ══════════════════════════════════════════════════════════
// MODAL
// ══════════════════════════════════════════════════════════
interface AuthRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthRequiredModal = ({ isOpen, onClose }: AuthRequiredModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="auth-required-modal-overlay" onClick={onClose}>
            <div
                className="auth-required-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="auth-required-modal__close" onClick={onClose}>
                    <i className="bi bi-x-lg" />
                </button>

                <div className="auth-required-modal__icon">
                    <i className="bi bi-headphones" />
                </div>

                <h3 className="auth-required-modal__title">
                    Увійдіть щоб слухати музику
                </h3>

                <p className="auth-required-modal__text">
                    Щоб відтворювати треки, потрібно увійти в акаунт або зареєструватися.
                </p>

                <div className="auth-required-modal__actions">
                    <Link
                        href="/register"
                        className="auth-required-modal__btn auth-required-modal__btn--primary"
                        onClick={onClose}
                    >
                        Зареєструватися
                    </Link>
                    <Link
                        href="/login"
                        className="auth-required-modal__btn auth-required-modal__btn--ghost"
                        onClick={onClose}
                    >
                        Увійти
                    </Link>
                </div>
            </div>
        </div>
    );
};