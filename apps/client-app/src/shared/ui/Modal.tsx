'use client';

import React, { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
    // Закрити по Escape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    // Блокуємо скрол body
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClass = {
        sm: 'modal-dialog-sm',
        md: 'modal-dialog-md',
        lg: 'modal-dialog-lg',
    }[size];

    return (
        <div className="client-modal-backdrop" onClick={onClose}>
            <div
                className={`client-modal ${sizeClass}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Заголовок */}
                <div className="client-modal__header">
                    <h2 className="client-modal__title">{title}</h2>
                    <button
                        className="client-modal__close"
                        onClick={onClose}
                        aria-label="Закрити"
                    >
                        <i className="bi bi-x" />
                    </button>
                </div>

                {/* Контент */}
                <div className="client-modal__body">
                    {children}
                </div>
            </div>
        </div>
    );
};