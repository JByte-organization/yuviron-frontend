'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    useGetApiAdminAlbumsId,
    getGetApiAdminAlbumsIdQueryKey,
    usePutApiAdminAlbumsId,
    VisibilityStatus,
    type AlbumListItemDto,
} from '@repo/api';
import { AsyncSelect, type SelectOption } from '@/shared/ui/AsyncSelect/AsyncSelect';

interface Props {
    album: AlbumListItemDto | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onSearchArtists: (term: string) => Promise<SelectOption[]>;
}

type FormValues = {
    title: string;
    description: string;
    coverUrl: string;
    releaseDate: string;
    visibilityStatus: string;
    scheduledPublishAt: string;
};

export const EditAlbumModal = ({ album, isOpen, onClose, onSuccess, onSearchArtists }: Props) => {
    const {
        register, handleSubmit, setError, reset, watch,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>();

    const [artists, setArtists] = useState<SelectOption[]>([]);

    const albumId = album?.id ?? '';

    const { data: details, isLoading } = useGetApiAdminAlbumsId(albumId, {
        query: {
            queryKey: getGetApiAdminAlbumsIdQueryKey(albumId),
            enabled: isOpen && !!albumId,
        },
    });

    const { mutateAsync: updateAlbum, isPending } = usePutApiAdminAlbumsId();

    const visibilityStatus = watch('visibilityStatus');

    useEffect(() => {
        if (!details) return;
        const d = (details as any).data || details;

        // Форматируем дату для input type="date" (YYYY-MM-DD)
        const toDateInput = (iso?: string | null) =>
            iso ? iso.split('T')[0] : '';

        // Форматируем для datetime-local (YYYY-MM-DDTHH:mm)
        const toDateTimeInput = (iso?: string | null) =>
            iso ? iso.slice(0, 16) : '';

        reset({
            title:              d.title ?? '',
            description:        d.description ?? '',
            coverUrl:           d.coverUrl ?? '',
            releaseDate:        toDateInput(d.releaseDate),
            visibilityStatus:   d.visibilityStatus ?? VisibilityStatus.Draft,
            scheduledPublishAt: toDateTimeInput(d.scheduledPublishAt),
        });

        setArtists((d.artists ?? []).map((a: any) => ({ id: a.artistId ?? a.id, label: a.name })));
    }, [details, reset]);

    const onSubmit = async (values: FormValues) => {
        if (!albumId) return;
        try {
            await updateAlbum({
                id: albumId,
                data: {
                    albumId,
                    title:              values.title,
                    description:        values.description || null,
                    coverUrl:           values.coverUrl || null,
                    releaseDate:        values.releaseDate || undefined,
                    visibilityStatus:   values.visibilityStatus as any,
                    scheduledPublishAt: values.scheduledPublishAt || null,
                    artistIds:          artists.map(a => a.id),
                },
            });
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
                setError('root', { message: `Error ${status}: Failed to update album.` });
            }
        }
    };

    if (!isOpen || !album) return null;

    const coverSrc = album.coverUrl
        ? `https://api.yuviron.com/storage/${album.coverUrl}`
        : null;

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
                                    : <span>💿</span>
                                }
                            </div>
                            <div>
                                <h5 className="modal-title fw-bold mb-0 text-cyan">Edit Album</h5>
                                <small className="text-secondary">ID: {album.id}</small>
                            </div>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} />
                    </div>

                    {isLoading ? (
                        <div className="modal-body p-5 text-center">
                            <div className="spinner-border text-info" />
                            <p className="text-secondary mt-3">Fetching album details...</p>
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
                                        <label className="form-label admin-text small fw-bold">STATUS</label>
                                        <select className="form-select admin-login__input text-white" {...register('visibilityStatus')}>
                                            {Object.values(VisibilityStatus).map(v => (
                                                <option key={v} value={v}>{v}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-4">
                                        <label className="form-label admin-text small fw-bold">RELEASE DATE</label>
                                        <input
                                            type="date"
                                            className="form-control admin-login__input"
                                            {...register('releaseDate')}
                                        />
                                    </div>
                                </div>

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

                                <div className="mb-4">
                                    <label className="form-label admin-text small fw-bold">COVER PATH</label>
                                    <input
                                        type="text"
                                        className="form-control admin-login__input text-secondary"
                                        {...register('coverUrl')}
                                    />
                                </div>

                                <AsyncSelect
                                    label="ARTISTS"
                                    selected={artists}
                                    onChange={setArtists}
                                    onSearch={onSearchArtists}
                                />

                            </div>

                            <div className="modal-footer border-0 p-4">
                                <button type="button" className="btn btn-admin-dark px-4" onClick={onClose}>Cancel</button>
                                <button type="submit" className="btn btn-primary px-5 fw-bold" disabled={isPending || isSubmitting}>
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