'use client';

import Link from 'next/link';
import { Modal } from '@/shared/ui/Modal';

interface EmailTakenModalProps {
    isOpen: boolean;
    onClose: () => void;
    onChangeEmail: () => void;
}

export const EmailTakenModal = ({ isOpen, onClose, onChangeEmail }: EmailTakenModalProps) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Пошта вже зареєстрована" size="sm">
        <p className="client-modal__message">
            Ця електронна пошта вже зареєстрована в системі. Увійдіть до акаунту або
            вкажіть іншу пошту.
        </p>

        <div className="client-modal__actions">
            <Link
                href="/login"
                className="client-modal__btn client-modal__btn--primary"
                onClick={onClose}
            >
                Увійти
            </Link>
            <button
                type="button"
                className="client-modal__btn client-modal__btn--ghost"
                onClick={onChangeEmail}
            >
                Змінити пошту
            </button>
        </div>
    </Modal>
);

export default EmailTakenModal;
