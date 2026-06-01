'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { usePostApiAdminAlbums, VisibilityStatus, ReleaseType, postApiFilesUpload } from '@repo/api/admin.ts';
import { AsyncSelect, type SelectOption } from '@/shared/ui/AsyncSelect/AsyncSelect';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onSearchArtists: (term: string) => Promise<SelectOption[]>;
}

type FormValues = {
    title: string;
    description: string;
    releaseType: string;
    releaseDate: string;
    visibilityStatus: string;
    scheduledPublishAt: string;
};

export const CreateAlbumModal = ({ isOpen, onClose, onSuccess, onSearchArtists }: Props) => {
    const {
        register, handleSubmit, setError, reset, watch,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: { visibilityStatus: VisibilityStatus.Draft, releaseType: ReleaseType.Album },
    });

    const [artists, setArtists] = useState<SelectOption[]>([]);
    const [coverFileId, setCoverFileId] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { mutateAsync: createAlbum, isPending } = usePostApiAdminAlbums();

    const visibilityStatus = watch('visibilityStatus');

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
        reset();
        setArtists([]);
        setCoverFileId(null);
        setPreviewUrl(null);
        setUploadError(null);
        onClose();
    };

    const onSubmit = async (values: FormValues) => {
        try {
            await createAlbum({
                data: {
                    title:              values.title,
                    description:        values.description || null,
                    coverFileId:        coverFileId ?? null,
                    releaseDate:        values.releaseDate || undefined,
                    releaseType:        values.releaseType as any,
                    visibilityStatus:   values.visibilityStatus as any,
                    scheduledPublishAt: values.scheduledPublishAt || null,
                    artistIds:          artists.map(a => a.id),
                },
            });
            reset();
            setArtists([]);
            setCoverFileId(null);
            setPreviewUrl(null);
            onSuccess();
            onClose();
        } catch (error: any) {
            const status = error.response?.status;
            const serverErrors = error.response?.data?.errors;
            if (status === 400 && serverErrors) {
                Object.keys(serverErrors).forEach(field => {
                    const key = (field.charAt(0).toLowerCase() + field.slice(1)) as keyof FormValues;
                    setError(key, { type: 'server', message: serverErrors[field]?.[0] });
                });
            } else {
                setError('root', { message: `Error ${status}: Failed to create album.` });
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">

                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold text-cyan">Create Album</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={handleClose} />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="modal-body p-4" style={{ overflowY: 'auto', maxHeight: '70vh' }}>

                            {errors.root && (
                                <div className="alert alert-danger py-2 mb-3">{errors.root.message}</div>
                            )}

                            {/* Title */}
                            <div className="mb-4">
                                <label className="form-label admin-text small fw-bold">TITLE *</label>
                                <input
                                    type="text"
                                    className={`form-control admin-login__input ${errors.title ? 'is-invalid' : ''}`}
                                    {...register('title', { required: 'Title is required' })}
                                />
                                {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <label className="form-label admin-text small fw-bold">DESCRIPTION</label>
                                <textarea
                                    className="form-control admin-login__input h-auto py-3"
                                    rows={3}
                                    {...register('description')}
                                />
                            </div>

                            <div className="row">
                                {/* Status */}
                                <div className="col-md-4 mb-4">
                                    <label className="form-label admin-text small fw-bold">STATUS</label>
                                    <select className="form-select admin-login__input text-white" {...register('visibilityStatus')}>
                                        {Object.values(VisibilityStatus).map(v => (
                                            <option key={v} value={v}>{v}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Release Type */}
                                <div className="col-md-4 mb-4">
                                    <label className="form-label admin-text small fw-bold">RELEASE TYPE</label>
                                    <select className="form-select admin-login__input text-white" {...register('releaseType')}>
                                        {Object.values(ReleaseType).map(v => (
                                            <option key={v} value={v}>{v}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Release Date */}
                                <div className="col-md-4 mb-4">
                                    <label className="form-label admin-text small fw-bold">RELEASE DATE</label>
                                    <input
                                        type="date"
                                        className="form-control admin-login__input"
                                        {...register('releaseDate')}
                                    />
                                </div>
                            </div>

                            {/* Scheduled publish — only if Scheduled */}
                            {visibilityStatus === VisibilityStatus.Scheduled && (
                                <div className="mb-4">
                                    <label className="form-label admin-text small fw-bold">SCHEDULED PUBLISH AT</label>
                                    <input
                                        type="datetime-local"
                                        className="form-control admin-login__input"
                                        {...register('scheduledPublishAt')}
                                    />
                                </div>
                            )}

                            {/* Cover upload */}
                            <div className="mb-4">
                                <label className="form-label admin-text small fw-bold">COVER IMAGE</label>
                                <div
                                    className={`upload-input ${coverFileId ? 'border-success' : ''}`}
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {previewUrl
                                        ? <img src={previewUrl} alt="cover preview" className="img-fluid rounded" style={{ maxHeight: '120px' }} />
                                        : <p className="mb-0 small mt-2 text-center">Click to upload cover image</p>
                                    }
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="d-none"
                                    onChange={handleFileChange}
                                />
                                {isUploading && <p className="text-info small mt-1">Uploading...</p>}
                                {uploadError && <p className="text-danger small mt-1">{uploadError}</p>}
                                {coverFileId && !uploadError && <p className="text-success small mt-1">Cover uploaded</p>}
                            </div>

                            {/* Artists autocomplete */}
                            <AsyncSelect
                                label="ARTISTS"
                                selected={artists}
                                onChange={setArtists}
                                onSearch={onSearchArtists}
                            />

                        </div>

                        <div className="modal-footer border-0 p-4">
                            <button type="button" className="btn btn-admin-dark px-4" onClick={handleClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-5 fw-bold" disabled={isPending || isSubmitting || isUploading}>
                                {isPending ? 'Creating...' : 'Create Album'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};