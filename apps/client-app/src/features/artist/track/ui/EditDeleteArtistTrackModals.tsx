'use client';

import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

// ══════════════════════════════════════════════════════════
// EDIT TRACK MODAL
// ══════════════════════════════════════════════════════════
interface EditProps {
    isOpen: boolean;
    trackId: string;
    trackTitle: string;
    onClose: () => void;
    onSuccess: () => void;
}

type EditFormValues = {
    title: string;
    explicit: boolean;
};

export const EditTrackModal = ({ isOpen, trackId, trackTitle, onClose, onSuccess }: EditProps) => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EditFormValues>({
        defaultValues: { title: trackTitle, explicit: false },
    });

    const [coverPreview,  setCoverPreview]  = useState<string | null>(null);
    const coverRef = useRef<HTMLInputElement>(null);

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCoverPreview(URL.createObjectURL(file));
    };

    const onSubmit = async (values: EditFormValues) => {
        console.log('edit track', trackId, values);
        // TODO: PUT /api/artist-dashboard/tracks/{trackId}
        await new Promise(r => setTimeout(r, 500));
        onSuccess();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="client-modal-overlay">
            <div className="client-modal client-modal--sm">
                <div className="client-modal__header">
                    <h2 className="client-modal__title">Редагувати трек</h2>
                    <button className="client-modal__close" onClick={onClose}>
                        <i className="bi bi-x-lg" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="client-modal__body">

                        <div className="row g-4 align-items-start mb-4">
                            <div className="col-auto">
                                <div
                                    className="upload-track-modal__cover"
                                    onClick={() => coverRef.current?.click()}
                                    title="Змінити обкладинку"
                                >
                                    {coverPreview ? (
                                        <img src={coverPreview} alt="cover" />
                                    ) : (
                                        <div className="upload-track-modal__cover-placeholder">
                                            <i className="bi bi-pencil" />
                                            <span>Змінити</span>
                                        </div>
                                    )}
                                </div>
                                <input ref={coverRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="d-none" onChange={handleCoverChange} />
                            </div>

                            <div className="col">
                                <label className="client-modal__field-label">Назва треку *</label>
                                <input
                                    type="text"
                                    className={`client-modal__input${errors.title ? ' client-modal__input--error' : ''}`}
                                    {...register('title', { required: "Назва обов'язкова" })}
                                />
                                {errors.title && <p className="client-modal__field-error">{errors.title.message}</p>}

                                <div className="form-check mt-3">
                                    <input type="checkbox" className="form-check-input" id="edit-explicit" {...register('explicit')} />
                                    <label className="form-check-label text-muted small" htmlFor="edit-explicit">
                                        Explicit
                                    </label>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="client-modal__footer">
                        <button type="button" className="client-modal__btn client-modal__btn--ghost" onClick={onClose}>
                            Скасувати
                        </button>
                        <button type="submit" className="client-modal__btn client-modal__btn--primary" disabled={isSubmitting}>
                            {isSubmitting ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                            Зберегти
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════
// DELETE TRACK MODAL
// ══════════════════════════════════════════════════════════
interface DeleteProps {
    isOpen: boolean;
    trackId: string;
    trackTitle: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const DeleteTrackModal = ({ isOpen, trackId, trackTitle, onClose, onSuccess }: DeleteProps) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            console.log('delete track', trackId);
            // TODO: DELETE /api/artist-dashboard/tracks/{trackId}
            await new Promise(r => setTimeout(r, 500));
            onSuccess();
            onClose();
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="client-modal-overlay">
            <div className="client-modal client-modal--xs">
                <div className="client-modal__header">
                    <h2 className="client-modal__title">Видалити трек</h2>
                    <button className="client-modal__close" onClick={onClose}>
                        <i className="bi bi-x-lg" />
                    </button>
                </div>

                <div className="client-modal__body">
                    <p className="text-muted mb-1">Ви впевнені що хочете видалити трек?</p>
                    <p className="text-theme fw-semibold mb-0">«{trackTitle}»</p>
                    <p className="text-danger small mt-3 mb-0">Цю дію неможливо скасувати.</p>
                </div>

                <div className="client-modal__footer">
                    <button className="client-modal__btn client-modal__btn--ghost" onClick={onClose} disabled={isDeleting}>
                        Скасувати
                    </button>
                    <button className="client-modal__btn client-modal__btn--danger" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                        Видалити
                    </button>
                </div>
            </div>
        </div>
    );
};