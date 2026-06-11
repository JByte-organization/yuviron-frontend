'use client';

import Link from 'next/link';
import { Modal } from '@/shared/ui/Modal';

interface EmailTakenModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Что делать по «Змінити пошту»: на шаге профиля — вернуть на email-шаг,
    // на самом email-шаге — просто закрыть модалку и дать поправить поле.
    onChangeEmail: () => void;
}

// Показывается, когда финальный register вернул 409 (почта занята). Введённые
// данные не сбрасываем — модалка только предлагает выход: войти или сменить почту.
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
