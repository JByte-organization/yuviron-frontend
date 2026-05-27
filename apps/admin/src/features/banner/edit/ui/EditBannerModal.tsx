'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
    useGetApiAdminBannersId,
    usePutApiAdminBannersId,
    postApiFilesUpload,
    getGetApiAdminBannersIdQueryKey,
    type BannerListItemDto,
    type BannerDetailsDto,
    type UpdateBannerCommand,
} from '@repo/api';
import { getImageUrl } from '@/shared/lib/getImageUrl';

interface Props {
    banner: BannerListItemDto | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type FormValues = {
    title: string;
    targetUrl: string;
    sortOrder: number;
    isActive: boolean;
};

export const EditBannerModal = ({ banner, isOpen, onClose, onSuccess }: Props) => {
    const {
        register, handleSubmit, setError, reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>();

    const bannerId = banner?.id ?? '';

    // ─── Upload стан ──────────────────────────────────────
    const [bannerFileId, setBannerFileId] = useState<string | null>(null);
    const [previewUrl,   setPreviewUrl]   = useState<string | null>(null);
    const [isUploading,  setIsUploading]  = useState(false);
    const [uploadError,  setUploadError]  = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── Запити ───────────────────────────────────────────
    const { data: detailsRaw, isLoading } = useGetApiAdminBannersId(bannerId, {
        query: {
            queryKey: getGetApiAdminBannersIdQueryKey(bannerId),
            enabled:  isOpen && !!bannerId,
        },
    });

    const { mutateAsync: updateBanner, isPending } = usePutApiAdminBannersId();

    const details: BannerDetailsDto | undefined =
        (detailsRaw as { data?: BannerDetailsDto } | undefined)?.data
        ?? detailsRaw as BannerDetailsDto | undefined;

    // ─── Pre-fill форми ───────────────────────────────────
    useEffect(() => {
        if (!details) return;

        reset({
            title:     details.title     ?? '',
            targetUrl: details.targetUrl ?? '',
            sortOrder: details.sortOrder ?? 1,
            isActive:  details.isActive  ?? true,
        });

        setPreviewUrl(getImageUrl(details.bannerUrl));
    }, [details, reset]);

    // ─── Upload ───────────────────────────────────────────
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            const res = await postApiFilesUpload({ file });
            const data = res as { fileId?: string; url?: string };
            if (!data.fileId) throw new Error('No fileId in response');
            setBannerFileId(data.fileId);
            setPreviewUrl(data.url ?? null);
        } catch {
            setUploadError('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        reset();
        setBannerFileId(null);
        setPreviewUrl(null);
        setUploadError(null);
        onClose();
    };

    // ─── Submit ───────────────────────────────────────────
    const onSubmit = async (values: FormValues) => {
        if (!bannerId) return;

        const body: UpdateBannerCommand = {
            bannerId,
            title:        values.title     || null,
            targetUrl:    values.targetUrl || null,
            bannerFileId: bannerFileId ?? null,
            sortOrder:    values.sortOrder,
            isActive:     values.isActive,
        };

        try {
            await updateBanner({ id: bannerId, data: body });
            onSuccess();
            handleClose();
        } catch (error: unknown) {
            const err = error as {
                response?: { status?: number; data?: { errors?: Record<string, string[]>; detail?: string } };
            };
            const status       = err.response?.status;
            const serverErrors = err.response?.data?.errors;
            const detail       = err.response?.data?.detail;

            if (status === 409) {
                setError('sortOrder', {
                    type:    'server',
                    message: 'This sort order is already taken. Please choose a different number.',
                });
            } else if (status === 400 && serverErrors) {
                Object.keys(serverErrors).forEach((field) => {
                    const key = (field.charAt(0).toLowerCase() + field.slice(1)) as keyof FormValues;
                    setError(key, { type: 'server', message: serverErrors[field]?.[0] });
                });
            } else {
                setError('root', { message: detail ?? `Error ${status}: Failed to update banner.` });
            }
        }
    };

    if (!isOpen || !banner) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">

                    <div className="modal-header border-secondary p-4">
                        <div>
                            <h5 className="modal-title fw-bold text-cyan mb-0">Edit Banner</h5>
                            <small className="text-secondary">ID: {banner.id}</small>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={handleClose} />
                    </div>

                    {isLoading ? (
                        <div className="modal-body p-5 text-center">
                            <div className="spinner-border text-info" />
                            <p className="text-secondary mt-3">Fetching banner details...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* ← scrollable body */}
                            <div className="modal-body p-4" style={{ overflowY: 'auto', maxHeight: '70vh' }}>

                                {errors.root && (
                                    <div className="alert alert-danger py-2 mb-3">{errors.root.message}</div>
                                )}

                                {/* Upload / Preview */}
                                <div className="mb-4">
                                    <label className="form-label admin-text small fw-bold">BANNER IMAGE</label>

                                    <div
                                        className="rounded overflow-hidden bg-secondary d-flex align-items-center justify-content-center mb-3 position-relative"
                                        style={{ width: '100%', height: 200, cursor: 'pointer' }}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Banner preview"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div className="text-center text-secondary">
                                                <i className="bi bi-image" style={{ fontSize: 40 }} />
                                                <p className="mb-0 small mt-2">Click to upload new image</p>
                                            </div>
                                        )}

                                        {isUploading && (
                                            <div
                                                className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center"
                                                style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                                            >
                                                <div className="spinner-border text-primary" />
                                            </div>
                                        )}

                                        {previewUrl && !isUploading && (
                                            <div
                                                className="position-absolute bottom-0 start-0 end-0 d-flex align-items-center justify-content-center py-2"
                                                style={{ backgroundColor: 'rgba(0,0,0,0.5)', fontSize: 13 }}
                                            >
                                                <i className="bi bi-pencil me-2" />
                                                Change image
                                            </div>
                                        )}
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        className="d-none"
                                        onChange={handleFileChange}
                                    />

                                    {uploadError && (
                                        <p className="text-danger small mt-1">{uploadError}</p>
                                    )}
                                </div>

                                {/* Title */}
                                <div className="mb-4">
                                    <label className="form-label admin-text small fw-bold">TITLE</label>
                                    <input
                                        type="text"
                                        className="form-control admin-login__input"
                                        placeholder="Banner title (optional)"
                                        {...register('title')}
                                    />
                                </div>

                                {/* Target URL */}
                                <div className="mb-4">
                                    <label className="form-label admin-text small fw-bold">TARGET URL</label>
                                    <input
                                        type="text"
                                        className="form-control admin-login__input"
                                        placeholder="https://... or /artists/123"
                                        {...register('targetUrl')}
                                    />
                                    <div className="form-text text-secondary small">
                                        URL куди веде баннер при кліку
                                    </div>
                                </div>

                                {/* Sort Order + Active */}
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label admin-text small fw-bold">SORT ORDER *</label>
                                        <input
                                            type="number"
                                            min={1}
                                            className={`form-control admin-login__input${errors.sortOrder ? ' is-invalid' : ''}`}
                                            {...register('sortOrder', {
                                                required:      'Sort order is required',
                                                valueAsNumber: true,
                                                min: { value: 1, message: 'Must be at least 1' },
                                            })}
                                        />
                                        <div className="form-text text-secondary small">
                                            Порядок відображення (унікальний)
                                        </div>
                                        {errors.sortOrder && (
                                            <div className="invalid-feedback">{errors.sortOrder.message}</div>
                                        )}
                                    </div>

                                    <div className="col-md-6 d-flex align-items-center pt-3">
                                        <div className="form-check form-switch">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="edit-isActive"
                                                {...register('isActive')}
                                            />
                                            <label
                                                className="form-check-label text-white fw-semibold"
                                                htmlFor="edit-isActive"
                                            >
                                                Active
                                            </label>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <div className="modal-footer border-0 p-4">
                                <button
                                    type="button"
                                    className="btn btn-admin-dark px-4"
                                    onClick={handleClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary px-5 fw-bold"
                                    disabled={isPending || isSubmitting || isUploading}
                                >
                                    {isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};