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
    Spam: "Спам / Неякісний або дубльований аудіозапис",
    CopyrightViolation: "Порушення моїх авторських прав (плагіат)",
    Pornography: "Невідповідний вміст аудіо чи обкладинки",
    HateSpeech: "Мова ворожнечі / Заклики до насильства",
    Abuse: "Нецензурна лексика без мітки Explicit / Образи",
    Scam: "Шахрайство або фейковий реліз",
    Other: "Інша причина"
};

interface ReportTrackModalProps {
    isOpen: boolean;
    onClose: () => void;
    trackId: string;
    trackTitle: string;
    onSuccess?: () => void;
}

type ReportFormValues = {
    reasonCode: keyof typeof ComplaintReasonCode;
    comment: string;
};

export const ReportTrackModal = ({ isOpen, onClose, trackId, trackTitle, onSuccess }: ReportTrackModalProps) => {
    const { mutateAsync: sendComplaint } = usePostApiComplaints();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<ReportFormValues>({
        defaultValues: { reasonCode: 'Spam', comment: '' }
    });

    const handleClose = () => {
        reset();
        onClose();
    };

    const onSubmit = async (values: ReportFormValues) => {
        try {
            await sendComplaint({
                data: {
                    targetType: 'Track',
                    targetId: trackId,
                    reasonCode: values.reasonCode,
                    comment: values.comment?.trim() || null
                }
            });
            onSuccess?.();
            handleClose();
        } catch (error) {
            console.error('[Track Complaint Error]', error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`Поскаржитися на трек "${trackTitle}"`}>
            <form onSubmit={handleSubmit(onSubmit)}>
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
                    <label className="client-modal__field-label mb-1">Деталі порушення (необов'язково)</label>
                    <textarea
                        className="client-modal__input w-100 p-2 text-white border border-secondary rounded"
                        style={{ backgroundColor: '#0f141c', height: '80px', resize: 'none', fontSize: '13px' }}
                        placeholder="Вкажіть таймкоди або суть порушення..."
                        {...register('comment', { maxLength: { value: 300, message: 'Максимум 300 символів' } })}
                    />
                    {errors.comment && <p className="client-modal__field-error mt-1">{errors.comment.message}</p>}
                </div>

                <div className="client-modal__footer d-flex justify-content-end gap-2 mt-4">
                    <button type="button" className="client-modal__btn client-modal__btn--ghost" onClick={handleClose} disabled={isSubmitting}>Скасувати</button>
                    <button type="submit" className="client-modal__btn" style={{ backgroundColor: '#dc3545', color: '#fff' }} disabled={isSubmitting}>Надіслати скаргу</button>
                </div>
            </form>
        </Modal>
    );
};