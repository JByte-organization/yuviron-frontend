'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { usePostApiAdminAds, postApiFilesUpload } from '@repo/api/admin.ts';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type FormValues = {
    advertiserName: string;
    title: string;
    clickUrl: string;
    isActive: boolean;
};

export const CreateAdModal = ({ isOpen, onClose, onSuccess }: Props) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
        defaultValues: { advertiserName: '', title: '', clickUrl: '', isActive: true }
    });

    const { mutateAsync: createAd, isPending } = usePostApiAdminAds();

    // Стейты медиафайлов
    const [imageFileId, setImageFileId] = useState<string | null>(null);
    const [audioFileId, setAudioFileId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<'none' | 'image' | 'audio'>('none');
    const [uploadError, setUploadError] = useState<string | null>(null);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);

    const handleClose = () => {
        reset();
        setImageFileId(null);
        setAudioFileId(null);
        setUploadError(null);
        onClose();
    };

    // Обобщенный хендлер загрузки файлов на сервер хранения Yuviron
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError(null);
        setIsUploading(type);

        try {
            // Используем системную функцию отправки файлов multipart/form-data
            const res = await postApiFilesUpload({ file });
            const data = (res as any)?.data ?? res;

            if (data?.fileId) {
                if (type === 'image') setImageFileId(data.fileId);
                if (type === 'audio') setAudioFileId(data.fileId);
            } else {
                setUploadError(`Failed to fetch identifier for ${type} file asset.`);
            }
        } catch {
            setUploadError('Network failure during media upload.');
        } finally {
            setIsUploading('none');
        }
    };

    const onSubmit = async (values: FormValues) => {
        if (!imageFileId || !audioFileId) {
            setUploadError('Both promotional Banner and Audio track are strictly required.');
            return;
        }

        try {
            const payload = {
                advertiserName: values.advertiserName.trim(),
                title: values.title.trim(),
                clickUrl: values.clickUrl.trim(),
                isActive: values.isActive,
                imageFileId,
                audioFileId
            };

            await createAd({ data: payload as Parameters<typeof createAd>[0]['data'] });
            onSuccess();
            handleClose();
        } catch {
            setUploadError('Failed to synchronize campaign entity with API gateway.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-md">
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">
                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold text-cyan">Launch New Advertisement</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={handleClose} />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="modal-body p-4 d-flex flex-column gap-3">
                            {uploadError && <div className="alert alert-danger py-2 small">{uploadError}</div>}

                            {/* Загрузка графического баннера */}
                            <div>
                                <label className="form-label text-secondary small fw-bold">PROMOTIONAL BANNER IMAGE *</label>
                                <input type="file" accept="image/*" ref={imageInputRef} className="d-none" onChange={e => handleFileUpload(e, 'image')} />
                                <div className="d-flex gap-2">
                                    <button type="button" className="btn btn-sm btn-admin-dark" disabled={isUploading !== 'none'} onClick={() => imageInputRef.current?.click()}>
                                        {isUploading === 'image' ? 'Uploading Image...' : imageFileId ? '✓ Change Banner' : '➕ Upload Image'}
                                    </button>
                                    {imageFileId && <span className="text-success small align-self-center font-monospace">ID: {imageFileId.slice(0, 8)}...</span>}
                                </div>
                            </div>

                            {/* Загрузка аудиодорожки рекламы */}
                            <div className="pb-2 border-bottom border-secondary">
                                <label className="form-label text-secondary small fw-bold">PROMOTIONAL AUDIO CLIP *</label>
                                <input type="file" accept="audio/*" ref={audioInputRef} className="d-none" onChange={e => handleFileUpload(e, 'audio')} />
                                <div className="d-flex gap-2">
                                    <button type="button" className="btn btn-sm btn-admin-dark" disabled={isUploading !== 'none'} onClick={() => audioInputRef.current?.click()}>
                                        {isUploading === 'audio' ? 'Uploading Audio...' : audioFileId ? '✓ Change Audio' : '➕ Upload Audio'}
                                    </button>
                                    {audioFileId && <span className="text-success small align-self-center font-monospace">ID: {audioFileId.slice(0, 8)}...</span>}
                                </div>
                            </div>

                            {/* Текстовые поля */}
                            <div>
                                <label className="form-label text-secondary small fw-bold">ADVERTISER BRAND NAME *</label>
                                <input type="text" className={`form-control admin-login__input ${errors.advertiserName ? 'is-invalid' : ''}`} placeholder="e.g., Nike" {...register('advertiserName', { required: true })} />
                            </div>

                            <div>
                                <label className="form-label text-secondary small fw-bold">CAMPAIGN SLOGAN / TITLE *</label>
                                <input type="text" className={`form-control admin-login__input ${errors.title ? 'is-invalid' : ''}`} placeholder="e.g., Summer Sale 2026" {...register('title', { required: true })} />
                            </div>

                            <div>
                                <label className="form-label text-secondary small fw-bold">TARGET REDIRECT CLICK URL (LINK)</label>
                                <input type="url" className="form-control admin-login__input" placeholder="https://nike.com/sale" {...register('clickUrl')} />
                            </div>

                            <div className="form-check form-switch mt-2">
                                <input className="form-check-input" type="checkbox" id="ad-active" {...register('isActive')} />
                                <label className="form-check-label fw-semibold" htmlFor="ad-active">Activate Immediately</label>
                            </div>
                        </div>

                        <div className="modal-footer border-0 p-4">
                            <button type="button" className="btn btn-admin-dark px-4" onClick={handleClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-5 fw-bold" disabled={isPending || isSubmitting || isUploading !== 'none'}>
                                {isPending ? 'Deploying...' : 'Deploy Ad'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};