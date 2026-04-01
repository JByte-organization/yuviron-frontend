'use client';

import React from 'react';

interface AdminModalProps {
    show: boolean;
    onHide: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'lg' | 'xl';
}

export const AdminModal = ({ show, onHide, title, children, footer, size }: AdminModalProps) => {
    if (!show) return null;

    return (
        <div
            className="modal d-block shadow"
            style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}
            onClick={onHide} // Закрытие при клике на оверлей
        >
            <div
                className={`modal-dialog modal-dialog-centered ${size ? `modal-${size}` : ''}`}
                onClick={e => e.stopPropagation()} // Чтобы не закрывалось при клике внутри модалки
            >
                <div className="modal-content bg-dark border-secondary text-white shadow-lg">
                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold text-uppercase tracking-wider">{title}</h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white shadow-none"
                            onClick={onHide}
                        ></button>
                    </div>

                    <div className="modal-body p-4">
                        {children}
                    </div>

                    {footer && (
                        <div className="modal-footer border-secondary p-4 pt-0">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminModal;