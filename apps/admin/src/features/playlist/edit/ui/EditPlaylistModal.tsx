'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
    useGetApiAdminPlaylistsId,
    getGetApiAdminPlaylistsIdQueryKey,
    usePutApiAdminPlaylistsId,
    PlaylistVisibility,
    postApiFilesUpload,
    type PlaylistDto,
} from '@repo/api/admin.ts';
import { AsyncSelect, type SelectOption } from '@/shared/ui/AsyncSelect/AsyncSelect';
import {getImageUrl} from "@/shared/lib/getImageUrl";

interface Props {
    playlist: PlaylistDto | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onSearchUsers: (term: string) => Promise<SelectOption[]>;
}

type FormValues = {
    title: string;
    description: string;
    visibility: string;
    isEditorial: boolean;
};

export const EditPlaylistModal = ({ playlist, isOpen, onClose, onSuccess, onSearchUsers }: Props) => {
    const {
        register, handleSubmit, setError, reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>();

    const [owner, setOwner] = useState<SelectOption[]>([]);
    const [coverFileId, setCoverFileId] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const playlistId = playlist?.id ?? '';

    const { data: details, isLoading } = useGetApiAdminPlaylistsId(playlistId, {
        query: {
            queryKey: getGetApiAdminPlaylistsIdQueryKey(playlistId),
            enabled: isOpen && !!playlistId,
        },
    });

    const { mutateAsync: updatePlaylist, isPending } = usePutApiAdminPlaylistsId();

    useEffect(() => {
        if (!details) return;
        const d = (details as any).data || details;

        reset({
            title:       d.title ?? '',
            description: d.description ?? '',
            visibility:  d.visibility ?? PlaylistVisibility.Public,
            isEditorial: d.isEditorial ?? false,
        });

        if (d.creator?.id && d.creator?.name) {
            setOwner([{ id: d.creator.id, label: d.creator.name || d.creator.email }]);
        }
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
        if (!playlistId) return;
        try {
            await updatePlaylist({
                id: playlistId,
                data: {
                    id:          playlistId,
                    title:       values.title,
                    description: values.description || null,
                    coverFileId: coverFileId ?? null,
                    visibility:  values.visibility as any,
                    isEditorial: values.isEditorial,
                    ownerUserId: owner[0]?.id || null,
                },
            });
            onSuccess();
            handleClose();
        } catch (error: any) {
            const status = error.response?.status;
            const serverErrors = error.response?.data?.errors;
            if (status === 400 && serverErrors) {
                Object.keys(serverErrors).forEach(field => {
                    const key = (field.charAt(0).toLowerCase() + field.slice(1)) as keyof FormValues;
                    setError(key, { type: 'server', message: serverErrors[field]?.[0] });
                });
            } else {
                setError('root', { message: `Error ${status}: Failed to update playlist.` });
            }
        }
    };

    if (!isOpen || !playlist) return null;

    const coverSrc = getImageUrl(playlist.coverUrl);

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">

                    <div className="modal-header border-secondary p-4">
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="rounded bg-secondary d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                                style={{ width: '40px', height: '40px' }}
                            >
                                {coverSrc
                                    ? <img src={coverSrc} alt="cover" className="w-100 h-100 object-fit-cover" />
                                    : <span>🎶</span>
                                }
                            </div>
                            <div>
                                <h5 className="modal-title fw-bold mb-0 text-cyan">Edit Playlist</h5>
                                <small className="text-secondary">ID: {playlist.id}</small>
                            </div>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={handleClose} />
                    </div>

                    {isLoading ? (
                        <div className="modal-body p-5 text-center">
                            <div className="spinner-border text-info" />
                            <p className="text-secondary mt-3">Fetching playlist details...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="modal-body p-4" style={{ overflowY: 'auto', maxHeight: '70vh' }}>

                                {errors.root && (
                                    <div className="alert alert-danger py-2 mb-3">{errors.root.message}</div>
                                )}

                                <div className="mb-4">
                                    <label className="form-label admin-text small fw-bold">TITLE *</label>
                                    <input
                                        type="text"
                                        className={`form-control admin-login__input ${errors.title ? 'is-invalid' : ''}`}
                                        {...register('title', { required: 'Title is required' })}
                                    />
                                    {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
                                </div>

                                <div className="mb-4">
                                    <label className="form-label admin-text small fw-bold">DESCRIPTION</label>
                                    <textarea
                                        className="form-control admin-login__input h-auto py-3"
                                        rows={3}
                                        {...register('description')}
                                    />
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-4">
                                        <label className="form-label admin-text small fw-bold">VISIBILITY</label>
                                        <select className="form-select admin-login__input text-white" {...register('visibility')}>
                                            {Object.values(PlaylistVisibility).map(v => (
                                                <option key={v} value={v}>{v}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Cover upload - leave empty to keep existing */}
                                    <div className="col-md-6 mb-4">
                                        <label className="form-label admin-text small fw-bold">COVER IMAGE</label>
                                        <div
                                            className={`upload-input ${coverFileId ? 'border-success' : ''}`}
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{ cursor: 'pointer', minHeight: '38px' }}
                                        >
                                            {previewUrl
                                                ? <img src={previewUrl} alt="cover preview" className="img-fluid rounded" style={{ maxHeight: '80px' }} />
                                                : <p className="mb-0 small mt-1 text-center text-secondary">Click to replace</p>
                                            }
                                        </div>
                                        <input ref={fileInputRef} type="file" accept="image/*" className="d-none" onChange={handleFileChange} />
                                        {isUploading && <p className="text-info small mt-1">Uploading...</p>}
                                        {uploadError && <p className="text-danger small mt-1">{uploadError}</p>}
                                        {coverFileId && !uploadError && <p className="text-success small mt-1">New cover uploaded</p>}
                                    </div>
                                </div>

                                <div className="mb-4 form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="edit-editorial"
                                        {...register('isEditorial')}
                                    />
                                    <label className="form-check-label text-secondary small" htmlFor="edit-editorial">
                                        Editorial playlist
                                    </label>
                                </div>

                                <AsyncSelect
                                    label="OWNER (USER)"
                                    placeholder="Search user..."
                                    selected={owner}
                                    onChange={(items) => setOwner(items.slice(-1))}
                                    onSearch={onSearchUsers}
                                />

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