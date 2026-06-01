'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { usePostApiAdminBanners, postApiFilesUpload, type CreateBannerCommand } from '@repo/api/admin.ts';

interface Props {
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

const IMAGE_BASE = 'https://dev-i.yuviron.com';

export const CreateBannerModal = ({ isOpen, onClose, onSuccess }: Props) => {
    const {
        register, handleSubmit, setError, reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: {
            title:     '',
            targetUrl: '',
            sortOrder: 1,
            isActive:  true,
        },
    });

    // ─── Upload стан ──────────────────────────────────────
    const [bannerFileId,  setBannerFileId]  = useState<string | null>(null);
    const [previewUrl,    setPreviewUrl]    = useState<string | null>(null);
    const [isUploading,   setIsUploading]   = useState(false);
    const [uploadError,   setUploadError]   = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { mutateAsync: createBanner, isPending } = usePostApiAdminBanners();

    // ─── Upload файлу ─────────────────────────────────────
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

    const onSubmit = async (values: FormValues) => {
        if (!bannerFileId) {
            setError('root', { message: 'Please upload a banner image.' });
            return;
        }

        const body: CreateBannerCommand = {
            title:        values.title     || null,
            targetUrl:    values.targetUrl || null,
            bannerFileId: bannerFileId,
            sortOrder:    values.sortOrder,
            isActive:     values.isActive,
        };

        try {
            await createBanner({ data: body });
            onSuccess();
            handleClose();
        } catch (error: unknown) {
            const err = error as {
                response?: { status?: number; data?: { errors?: Record<string, string[]>; detail?: string } };
            };
            const status       = err.response?.status;
            const serverErrors = err.response?.data?.errors;
            const detail       = err.response?.data?.detail;

            if (status === 400 && serverErrors) {
                Object.keys(serverErrors).forEach((field) => {
                    const key = (field.charAt(0).toLowerCase() + field.slice(1)) as keyof FormValues;
                    setError(key, { type: 'server', message: serverErrors[field]?.[0] });
                });
            } else {
                setError('root', { message: detail ?? `Error ${status}: Failed to create banner.` });
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">

                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold text-cyan">Create Banner</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={handleClose} />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="modal-body p-4" style={{overflowY: 'auto', maxHeight: '70vh'}}>

                            {errors.root && (
                                <div className="alert alert-danger py-2 mb-3">{errors.root.message}</div>
                            )}

                            {/* Upload зображення */}
                            <div className="mb-4">
                                <label className="form-label admin-text small fw-bold">
                                    BANNER IMAGE *
                                </label>

                                {/* Превью */}
                                <div
                                    className="rounded overflow-hidden bg-secondary d-flex align-items-center justify-content-center mb-3 position-relative"
                                    style={{width: '100%', height: 200, cursor: 'pointer'}}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Banner preview"
                                            style={{width: '100%', height: '100%', objectFit: 'cover'}}
                                        />
                                    ) : (
                                        <div className="text-center text-secondary">
                                            <i className="bi bi-image" style={{fontSize: 40}}/>
                                            <p className="mb-0 small mt-2">Click to upload image</p>
                                            <p className="mb-0" style={{fontSize: 11}}>JPG, PNG, WEBP — max 50MB</p>
                                        </div>
                                    )}

                                    {isUploading && (
                                        <div
                                            className="position-absolute inset-0 d-flex align-items-center justify-content-center"
                                            style={{backgroundColor: 'rgba(0,0,0,0.6)'}}
                                        >
                                            <div className="spinner-border text-primary"/>
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

                                {bannerFileId && (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Change image
                                    </button>
                                )}

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
                                    className={`form-control admin-login__input${errors.targetUrl ? ' is-invalid' : ''}`}
                                    placeholder="https://... or /artists/123"
                                    {...register('targetUrl')}
                                />
                                <div className="form-text text-secondary small">
                                    URL куди веде баннер при кліку
                                </div>
                                {errors.targetUrl && (
                                    <div className="invalid-feedback">{errors.targetUrl.message}</div>
                                )}
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
                                            required: 'Sort order is required',
                                            valueAsNumber: true,
                                            min: {value: 1, message: 'Must be at least 1'},
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
                                            id="create-isActive"
                                            {...register('isActive')}
                                        />
                                        <label
                                            className="form-check-label text-white fw-semibold"
                                            htmlFor="create-isActive"
                                        >
                                            Active
                                        </label>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="modal-footer border-0 p-4">
                        <button type="button" className="btn btn-admin-dark px-4" onClick={handleClose}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary px-5 fw-bold"
                                disabled={isPending || isSubmitting || isUploading}
                            >
                                {isPending ? 'Creating...' : 'Create Banner'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};