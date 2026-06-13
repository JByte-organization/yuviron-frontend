'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import {
    useGetApiAdminAdsId,
    usePutApiAdminAdsId,
    postApiFilesUpload,
    getGetApiAdminAdsIdQueryKey,
    type AdSummaryDto,
    type AdDetailsDto,
    type UpdateAdCommand
} from '@repo/api/admin.ts';
import { getImageUrl } from '@/shared/lib/getImageUrl';

interface EditAdModalProps {
    ad: AdSummaryDto | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type FormValues = {
    advertiserName: string;
    title: string;
    clickUrl: string;
};

export const EditAdModal = ({ ad, isOpen, onClose, onSuccess }: EditAdModalProps) => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<FormValues>();

    const adId = ad?.id ?? '';

    // ─── Медіа-стейти (Картинка + Аудіо) ───
    const [imageFileId, setImageFileId] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [audioFileId, setAudioFileId] = useState<string | null>(null);
    const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);

    const [isUploading, setIsUploading] = useState<'none' | 'image' | 'audio'>('none');
    const [uploadError, setUploadError] = useState<string | null>(null);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);

    const { data: detailsRaw, isLoading } = useGetApiAdminAdsId(adId, {
        query: {
            queryKey: getGetApiAdminAdsIdQueryKey(adId),
            enabled: isOpen && !!adId,
        }
    });

    const { mutateAsync: updateAd, isPending } = usePutApiAdminAdsId();
    const details = (detailsRaw as { data?: AdDetailsDto } | undefined)?.data ?? (detailsRaw as AdDetailsDto | undefined);

    useEffect(() => {
        if (!details) return;
        reset({
            advertiserName: details.advertiserName ?? '',
            title: details.title ?? '',
            clickUrl: details.clickUrl ?? ''
        });

        setPreviewUrl(getImageUrl(details.imageUrl));
        setPreviewAudioUrl(getImageUrl(details.audioUrl));
    }, [details, reset]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(type);
        setUploadError(null);

        try {
            const res = await postApiFilesUpload({ file });
            const data = res as { fileId?: string; url?: string };
            if (!data.fileId) throw new Error();

            if (type === 'image') {
                setImageFileId(data.fileId);
                setPreviewUrl(data.url ?? null);
            } else {
                setAudioFileId(data.fileId);
                setPreviewAudioUrl(data.url ?? null);
            }
        } catch {
            setUploadError(`Failed to upload ${type} resource asset.`);
        } {
            setIsUploading('none');
        }
    };

    const handleClose = () => {
        reset();
        setImageFileId(null);
        setPreviewUrl(null);
        setAudioFileId(null);
        setPreviewAudioUrl(null);
        setUploadError(null);
        onClose();
    };

    const onSubmit = async (values: FormValues) => {
        if (!adId) return;

        const body: UpdateAdCommand = {
            adId,
            advertiserName: values.advertiserName.trim(),
            title: values.title.trim(),
            clickUrl: values.clickUrl.trim() || null,
            audioFileId: audioFileId || undefined,
            imageFileId: imageFileId || undefined,
            isActive: details?.isActive
        };

        try {
            await updateAd({ id: adId, data: body });
            await queryClient.invalidateQueries({ queryKey: getGetApiAdminAdsIdQueryKey(adId) });
            onSuccess();
            handleClose();
        } catch {
            setError('root', { message: 'Failed to synchronize updated assets with API.' });
        }
    };

    if (!isOpen || !ad) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-md">
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">
                    <div className="modal-header border-secondary p-4">
                        <div>
                            <h5 className="modal-title fw-bold text-cyan mb-0">Modify Marketing Target</h5>
                            <small className="text-secondary">Ad ID: {adId}</small>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={handleClose} />
                    </div>

                    {isLoading ? (
                        <div className="modal-body p-5 text-center">
                            <div className="spinner-border text-info" />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="modal-body p-4 d-flex flex-column gap-3" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                                {uploadError && <div className="alert alert-danger py-2 small">{uploadError}</div>}

                                {/* 1. Зображення Баннера */}
                                <div>
                                    <label className="form-label text-secondary small fw-bold">PROMOTIONAL BANNER IMAGE</label>
                                    <div className="rounded overflow-hidden bg-secondary d-flex align-items-center justify-content-center mb-2 position-relative" style={{ width: '100%', height: 140, cursor: 'pointer' }} onClick={() => imageInputRef.current?.click()}>
                                        {previewUrl ? <img src={previewUrl} alt="Preview" className="w-100 h-100 object-fit-cover" /> : <span className="text-muted small">Click to upload image</span>}
                                        {isUploading === 'image' && <div className="position-absolute w-100 h-100 bg-dark bg-opacity-70 d-flex align-items-center justify-content-center"><div className="spinner-border spinner-border-sm text-primary" /></div>}
                                    </div>
                                    <input ref={imageInputRef} type="file" accept="image/*" className="d-none" onChange={e => handleFileUpload(e, 'image')} />
                                </div>

                                {/* 2. Аудіо Трэк */}
                                <div>
                                    <label className="form-label text-secondary small fw-bold">COMMERCIAL AUDIO TRACK</label>
                                    <div className="p-3 rounded bg-dark border border-secondary mb-2 d-flex flex-column gap-2">
                                        {previewAudioUrl && <audio src={previewAudioUrl} controls className="w-100 admin-audio-native" style={{ height: '32px' }} />}
                                        <button type="button" className="btn btn-sm btn-admin-dark w-100" disabled={isUploading !== 'none'} onClick={() => audioInputRef.current?.click()}>
                                            {isUploading === 'audio' ? 'Uploading audio file...' : 'Replace Audio File'}
                                        </button>
                                    </div>
                                    <input ref={audioInputRef} type="file" accept="audio/*" className="d-none" onChange={e => handleFileUpload(e, 'audio')} />
                                </div>

                                <div>
                                    <label className="form-label text-secondary small fw-bold">ADVERTISER BRAND NAME *</label>
                                    <input type="text" className="form-control admin-login__input" {...register('advertiserName', { required: true })} />
                                </div>

                                <div>
                                    <label className="form-label text-secondary small fw-bold">CAMPAIGN SLOGAN / TITLE *</label>
                                    <input type="text" className="form-control admin-login__input" {...register('title', { required: true })} />
                                </div>

                                <div>
                                    <label className="form-label text-secondary small fw-bold">TARGET REDIRECT CLICK URL (LINK)</label>
                                    <input type="url" className="form-control admin-login__input" {...register('clickUrl')} />
                                </div>
                            </div>

                            <div className="modal-footer border-0 p-4">
                                <button type="button" className="btn btn-admin-dark px-4" onClick={handleClose}>Cancel</button>
                                <button type="submit" className="btn btn-primary px-5 fw-bold" disabled={isPending || isSubmitting || isUploading !== 'none'}>Save Changes</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};