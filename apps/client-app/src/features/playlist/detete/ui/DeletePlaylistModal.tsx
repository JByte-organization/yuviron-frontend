'use client';

import React, { useState } from 'react';
import { Modal } from '@/shared/ui/Modal';

// ─── Типи ─────────────────────────────────────────────────────────────────────
interface DeletePlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    // onSuccess тепер async — бо в PlaylistPage ми await deletePlaylist()
    onSuccess?: () => Promise<void>;
    playlistName: string;
    playlistId: string;
}

// ─── Компонент ────────────────────────────────────────────────────────────────
// Архітектура: модалка НЕ робить API запит сама.
// Вона тільки підтверджує дію і викликає onSuccess.
// Реальне видалення відбувається в PlaylistPage через handleDeleteSuccess.
// Причина: сторінка знає куди редіректити після видалення, модалка — ні.
export const DeletePlaylistModal = ({
                                        isOpen,
                                        onClose,
                                        onSuccess,
                                        playlistName,
                                        playlistId: _playlistId, // eslint-disable-line @typescript-eslint/no-unused-vars
                                    }: DeletePlaylistModalProps) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onSuccess?.();
            onClose();
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Видалення плейліста"
            size="sm"
        >
            <p className="client-modal__confirm-text">
                Ти впевнений що хочеш видалити плейліст{' '}
                <strong className="text-white">"{playlistName}"</strong>?
            </p>
            <p className="client-modal__confirm-hint">
                Цю дію неможливо скасувати.
            </p>

            <div className="client-modal__footer">
                <button
                    type="button"
                    className="client-modal__btn client-modal__btn--ghost"
                    onClick={onClose}
                    disabled={isDeleting}
                >
                    Скасувати
                </button>
                <button
                    type="button"
                    className="client-modal__btn client-modal__btn--danger"
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    {isDeleting && (
                        <span className="spinner-border spinner-border-sm me-2" />
                    )}
                    Видалити
                </button>
            </div>
        </Modal>
    );
};