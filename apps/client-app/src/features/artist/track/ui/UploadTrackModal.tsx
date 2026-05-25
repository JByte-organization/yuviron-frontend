'use client';

import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type FormValues = {
    title: string;
    explicit: boolean;
};

export const UploadTrackModal = ({ isOpen, onClose, onSuccess }: Props) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
        defaultValues: { title: '', explicit: false },
    });

    const [audioFile,     setAudioFile]     = useState<File | null>(null);
    const [coverFile,     setCoverFile]     = useState<File | null>(null);
    const [coverPreview,  setCoverPreview]  = useState<string | null>(null);
    const [isUploading,   setIsUploading]   = useState(false);

    const audioRef = useRef<HTMLInputElement>(null);
    const coverRef = useRef<HTMLInputElement>(null);

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAudioFile(file);
    };

    const handleClose = () => {
        reset();
        setAudioFile(null);
        setCoverFile(null);
        setCoverPreview(null);
        onClose();
    };

    const onSubmit = async (values: FormValues) => {
        if (!audioFile) return;
        setIsUploading(true);
        try {
            console.log('upload track', values, audioFile, coverFile);
            // TODO:
            // 1. POST /api/files/upload (audioFile) → audioPath
            // 2. POST /api/files/upload (coverFile) → coverPath
            // 3. POST /api/artist-dashboard/tracks { title, audioPath, coverPath, explicit }
            await new Promise(r => setTimeout(r, 1000)); // mock
            onSuccess();
            handleClose();
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="client-modal-overlay">
            <div className="client-modal client-modal--md">
                <div className="client-modal__header">
                    <h2 className="client-modal__title">Завантажити трек</h2>
                    <button className="client-modal__close" onClick={handleClose}>
                        <i className="bi bi-x-lg" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="client-modal__body" style={{ overflowY: 'auto', maxHeight: '65vh' }}>

                        {/* Обкладинка + назва */}
                        <div className="row g-4 align-items-start mb-4">
                            <div className="col-auto">
                                <div
                                    className="upload-track-modal__cover"
                                    onClick={() => coverRef.current?.click()}
                                    title="Клікни щоб вибрати обкладинку"
                                >
                                    {coverPreview ? (
                                        <img src={coverPreview} alt="cover" />
                                    ) : (
                                        <div className="upload-track-modal__cover-placeholder">
                                            <i className="bi bi-image" />
                                            <span>Обкладинка</span>
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
                                    placeholder="Введіть назву..."
                                    {...register('title', { required: "Назва обов'язкова" })}
                                />
                                {errors.title && <p className="client-modal__field-error">{errors.title.message}</p>}

                                <div className="form-check mt-3">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="explicit"
                                        {...register('explicit')}
                                    />
                                    <label className="form-check-label text-muted small" htmlFor="explicit">
                                        Містить нецензурну лексику (Explicit)
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Аудіо файл */}
                        <div className="mb-3">
                            <label className="client-modal__field-label">Аудіо файл *</label>
                            <div
                                className={`upload-track-modal__audio${audioFile ? ' upload-track-modal__audio--selected' : ''}`}
                                onClick={() => audioRef.current?.click()}
                            >
                                {audioFile ? (
                                    <>
                                        <i className="bi bi-file-music" />
                                        <span>{audioFile.name}</span>
                                        <span className="upload-track-modal__audio-size">
                                            {(audioFile.size / 1024 / 1024).toFixed(1)} MB
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-cloud-upload" />
                                        <span>Клікни або перетягни MP3/WAV файл</span>
                                        <span className="upload-track-modal__audio-hint">Макс. 50 MB</span>
                                    </>
                                )}
                            </div>
                            <input ref={audioRef} type="file" accept=".mp3,.wav" className="d-none" onChange={handleAudioChange} />
                        </div>

                    </div>

                    <div className="client-modal__footer">
                        <button type="button" className="client-modal__btn client-modal__btn--ghost" onClick={handleClose}>
                            Скасувати
                        </button>
                        <button
                            type="submit"
                            className="client-modal__btn client-modal__btn--primary"
                            disabled={!audioFile || isSubmitting || isUploading}
                        >
                            {isUploading ? <><span className="spinner-border spinner-border-sm me-2" />Завантаження...</> : 'Завантажити'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};