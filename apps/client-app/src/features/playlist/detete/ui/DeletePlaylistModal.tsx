'use client';

import React, { useState } from 'react';
import { Modal } from '@/shared/ui/Modal';

interface DeletePlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => Promise<void>;
    playlistName: string;
}

export const DeletePlaylistModal = ({
                                        isOpen,
                                        onClose,
                                        onSuccess,
                                        playlistName,
                                    }: DeletePlaylistModalProps) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!onSuccess) {
            onClose();
            return;
        }

        setIsDeleting(true);
        try {
            await onSuccess();
            onClose();
        } catch (error) {
            console.error('[DeletePlaylist Error] Не вдалося видалити плейліст:', error);
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
                <strong className="text-theme">"{playlistName}"</strong>?
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