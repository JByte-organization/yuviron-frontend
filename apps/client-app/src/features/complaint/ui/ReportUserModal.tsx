'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { usePostApiComplaints } from '@repo/api/client.ts';
import { Modal } from '@/shared/ui/Modal';

const ComplaintReasonCode = {
    Spam: "Spam",
    CopyrightViolation: "CopyrightViolation",
    Pornography: "Pornography",
    HateSpeech: "HateSpeech",
    Abuse: "Abuse",
    Scam: "Scam",
    Other: "Other",
} as const;

const REASON_LABELS: Record<keyof typeof ComplaintReasonCode, string> = {
    Spam: "Спам / Нав'язлива реклама",
    CopyrightViolation: "Порушення авторських прав",
    Pornography: "Порнографія або інтимний контент",
    HateSpeech: "Мова ворожнечі / Дискримінація",
    Abuse: "Образи / Цькування / Аб'юз",
    Scam: "Шахрайство або обман",
    Other: "Інша причина"
};

interface ReportUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
    onSuccess?: () => void;
}

type ReportFormValues = {
    reasonCode: keyof typeof ComplaintReasonCode;
    comment: string;
};

export const ReportUserModal = ({ isOpen, onClose, userId, userName, onSuccess }: ReportUserModalProps) => {
    const { mutateAsync: sendComplaint } = usePostApiComplaints();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<ReportFormValues>({
        defaultValues: {
            reasonCode: 'Spam',
            comment: ''
        }
    });

    const handleClose = () => {
        reset();
        onClose();
    };

    const onSubmit = async (values: ReportFormValues) => {
        try {
            // Формуємо команду CreateComplaintCommand для відправки на бекенд за схемою TargetType = User
            await sendComplaint({
                data: {
                    targetType: 'User',
                    targetId: userId,
                    reasonCode: values.reasonCode,
                    comment: values.comment?.trim() || null
                }
            });

            onSuccess?.();
            handleClose();
        } catch (error) {
            console.error('[Complaint] Помилка при відправці скарги на користувача:', error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`Надіслати скаргу на ${userName}`}>
            <form onSubmit={handleSubmit(onSubmit)} className="client-modal-form">
                <div className="mb-4">
                    <label className="client-modal__field-label mb-2 d-block small text-white-50">Оберіть причину скарги</label>
                    <div className="d-flex flex-column gap-2">
                        {Object.entries(ComplaintReasonCode).map(([key, code]) => (
                            <label key={code} className="d-flex align-items-center gap-2 text-white small p-2 rounded transition-all" style={{ backgroundColor: '#161b26', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    value={code}
                                    className="form-check-input bg-transparent border-secondary shadow-none"
                                    {...register('reasonCode', { required: true })}
                                />
                                <span>{REASON_LABELS[key as keyof typeof ComplaintReasonCode]}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="mb-3">
                    <label className="client-modal__field-label mb-1">Додатковий коментар (необов'язково)</label>
                    <textarea
                        className="client-modal__input w-100 p-2 text-white border border-secondary rounded"
                        style={{ backgroundColor: '#0f141c', height: '90px', resize: 'none', fontSize: '13px' }}
                        placeholder="Опишіть деталі порушення..."
                        {...register('comment', { maxLength: { value: 300, message: 'Максимум 300 символів' } })}
                    />
                    {errors.comment && (
                        <p className="client-modal__field-error mt-1">{errors.comment.message}</p>
                    )}
                </div>

                <div className="client-modal__footer d-flex justify-content-end gap-2 mt-4">
                    <button type="button" className="client-modal__btn client-modal__btn--ghost" onClick={handleClose} disabled={isSubmitting}>
                        Скасувати
                    </button>
                    <button type="submit" className="client-modal__btn" style={{ backgroundColor: '#dc3545', color: '#fff' }} disabled={isSubmitting}>
                        {isSubmitting && <span className="spinner-border spinner-border-sm me-2" />}
                        Надіслати скаргу
                    </button>
                </div>
            </form>
        </Modal>
    );
};