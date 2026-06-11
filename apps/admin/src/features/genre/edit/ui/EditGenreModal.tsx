'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
    useGetApiAdminGenresId,
    getGetApiAdminGenresIdQueryKey,
    usePutApiAdminGenresId,
    postApiFilesUpload,
    type GenreListItemDto,
} from '@repo/api/admin.ts';
import {getImageUrl} from "@/shared/lib/getImageUrl";

interface Props {
    genre: GenreListItemDto | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type FormValues = {
    name: string;
};

export const EditGenreModal = ({ genre, isOpen, onClose, onSuccess }: Props) => {
    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>();

    const [coverFileId, setCoverFileId] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const genreId = genre?.id ?? '';

    const { data: details, isLoading } = useGetApiAdminGenresId(genreId, {
        query: {
            queryKey: getGetApiAdminGenresIdQueryKey(genreId),
            enabled: isOpen && !!genreId,
        },
    });

    const { mutateAsync: updateGenre, isPending } = usePutApiAdminGenresId();

    useEffect(() => {
        if (!details) return;
        const d = (details as any).data || details;
        reset({ name: d.name ?? '' });
    }, [details, reset]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        setUploadError(null);
        try {
            const res = await postApiFilesUpload({ file });
            const data = res as { fileId?: string; url?: string };
            if (!data.fileId) throw new Error('No fileId in response');
            setCoverFileId(data.fileId);
            setPreviewUrl(data.url ?? null);
        } catch {
            setUploadError('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setCoverFileId(null);
        setPreviewUrl(null);
        setUploadError(null);
        onClose();
    };

    const onSubmit = async (values: FormValues) => {
        if (!genreId) return;
        try {
            await updateGenre({
                id: genreId,
                data: {
                    genreId,
                    name: values.name,
                    coverFileId: coverFileId ?? null,
                },
            });
            onSuccess();
            handleClose();
        } catch (error: any) {
            const status = error.response?.status;
            const serverErrors = error.response?.data?.errors;
            if (status === 400 && serverErrors) {
                Object.keys(serverErrors).forEach((field) => {
                    const key = (field.charAt(0).toLowerCase() + field.slice(1)) as keyof FormValues;
                    setError(key, { type: 'server', message: serverErrors[field]?.[0] });
                });
            } else {
                setError('root', { message: `Error ${status}: Failed to update genre.` });
            }
        }
    };

    if (!isOpen || !genre) return null;

    const coverSrc = getImageUrl(genre.coverUrl);

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">

                    <div className="modal-header border-secondary p-4">
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="rounded bg-dark d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                                style={{ width: '40px', height: '40px' }}
                            >
                                {coverSrc
                                    ? <img src={coverSrc} alt="cover" className="w-100 h-100 object-fit-cover" />
                                    : <span>🎵</span>
                                }
                            </div>
                            <div>
                                <h5 className="modal-title fw-bold mb-0 text-cyan">Edit Genre</h5>
                                <small className="text-secondary">ID: {genre.id}</small>
                            </div>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={handleClose} />
                    </div>

                    {isLoading ? (
                        <div className="modal-body p-5 text-center">
                            <div className="spinner-border text-info" />
                            <p className="text-secondary mt-3">Fetching genre details...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="modal-body p-4">

                                {errors.root && (
                                    <div className="alert alert-danger py-2 mb-3">
                                        {errors.root.message}
                                    </div>
                                )}

                                <div className="mb-4">
                                    <label className="form-label admin-text small fw-bold">NAME *</label>
                                    <input
                                        type="text"
                                        className={`form-control admin-login__input ${errors.name ? 'is-invalid' : ''}`}
                                        {...register('name', { required: 'Name is required' })}
                                    />
                                    {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                                </div>

                                {/* Cover upload - leave empty to keep existing */}
                                <div className="mb-2">
                                    <label className="form-label admin-text small fw-bold">COVER IMAGE</label>
                                    <div
                                        className={`upload-input ${coverFileId ? 'border-success' : ''}`}
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {previewUrl
                                            ? <img src={previewUrl} alt="cover preview" className="img-fluid rounded" style={{ maxHeight: '120px' }} />
                                            : <p className="mb-0 small mt-2 text-center text-secondary">Click to replace cover image (leave empty to keep current)</p>
                                        }
                                    </div>
                                    <input ref={fileInputRef} type="file" accept="image/*" className="d-none" onChange={handleFileChange} />
                                    {isUploading && <p className="text-info small mt-1">Uploading...</p>}
                                    {uploadError && <p className="text-danger small mt-1">{uploadError}</p>}
                                    {coverFileId && !uploadError && <p className="text-success small mt-1">New cover uploaded</p>}
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