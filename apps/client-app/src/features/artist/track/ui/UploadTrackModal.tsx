'use client';

import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    AppPermission,
    getGetApiStudioArtistAlbumsQueryKey,
    useGetApiStudioArtistAlbums,
    usePostApiStudioArtistTracks,
    type StudioAlbumListItemDto,
} from '@repo/api/artist.ts';
import { usePostApiFilesUpload } from '@repo/api/client.ts';
import { useCurrentArtistId } from '@/entities/artist/model/currentArtist';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type FormValues = {
    title: string;
    explicit: boolean;
    albumId: string;
};

const extractFileId = (res: unknown): string | null => {
    const r = res as { fileId?: string; data?: { fileId?: string } } | null;
    return r?.data?.fileId ?? r?.fileId ?? null;
};

const unwrapItems = <T,>(raw: unknown): T[] => {
    if (!raw) return [];
    const obj = raw as { items?: T[]; data?: { items?: T[] } };
    return obj.items ?? obj.data?.items ?? [];
};

export const UploadTrackModal = ({ isOpen, onClose, onSuccess }: Props) => {
    const artistId = useCurrentArtistId();
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
        defaultValues: { title: '', explicit: false, albumId: '' },
    });

    const [audioFile,     setAudioFile]     = useState<File | null>(null);
    const [coverFile,     setCoverFile]     = useState<File | null>(null);
    const [coverPreview,  setCoverPreview]  = useState<string | null>(null);
    const [isUploading,   setIsUploading]   = useState(false);
    const [error,         setError]         = useState<string | null>(null);

    const audioRef = useRef<HTMLInputElement>(null);
    const coverRef = useRef<HTMLInputElement>(null);

    // Альбоми артиста для випадашки (трек обовʼязково належить альбому).
    const albumsParams = { ArtistId: artistId ?? undefined, Page: 1, PageSize: 100 };
    const { data: albumsRaw } = useGetApiStudioArtistAlbums(albumsParams, {
        query: { enabled: !!artistId && isOpen, queryKey: getGetApiStudioArtistAlbumsQueryKey(albumsParams) },
    });
    const albums = unwrapItems<StudioAlbumListItemDto>(albumsRaw);

    const { mutateAsync: uploadFile } = usePostApiFilesUpload();
    const { mutateAsync: createTrack } = usePostApiStudioArtistTracks();

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
        setError(null);
        onClose();
    };

    const onSubmit = async (values: FormValues) => {
        if (!audioFile || !values.albumId) return;
        setError(null);
        setIsUploading(true);
        try {
            const audioFileId = extractFileId(await uploadFile({ data: { file: audioFile } }));
            if (!audioFileId) throw new Error('upload failed');
            const coverFileId = coverFile
                ? extractFileId(await uploadFile({ data: { file: coverFile } }))
                : null;

            await createTrack({
                data: {
                    albumId: values.albumId,
                    title: values.title.trim(),
                    audioFileId,
                    coverFileId,
                    explicit: values.explicit,
                    requiredPermission: AppPermission.StudioArtistManage,
                },
            });
            onSuccess();
            handleClose();
        } catch {
            setError('Не вдалося завантажити трек. Спробуйте ще раз.');
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="client-modal-backdrop">
            <div className="client-modal modal-dialog-md">
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

                        {/* Альбом (трек належить альбому) */}
                        <div className="mb-3">
                            <label className="client-modal__field-label">Альбом *</label>
                            {albums.length === 0 ? (
                                <p className="client-modal__hint mb-0">
                                    Спочатку створіть альбом — трек завантажується в нього.
                                </p>
                            ) : (
                                <select
                                    className={`client-modal__input${errors.albumId ? ' client-modal__input--error' : ''}`}
                                    defaultValue=""
                                    {...register('albumId', { required: 'Оберіть альбом' })}
                                >
                                    <option value="" disabled>Оберіть альбом…</option>
                                    {albums.map((a) => (
                                        <option key={a.id} value={a.id}>{a.title}</option>
                                    ))}
                                </select>
                            )}
                            {errors.albumId && <p className="client-modal__field-error">{errors.albumId.message}</p>}
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
                        {error && <span className="client-modal__field-error me-auto">{error}</span>}
                        <button type="button" className="client-modal__btn client-modal__btn--ghost" onClick={handleClose}>
                            Скасувати
                        </button>
                        <button
                            type="submit"
                            className="client-modal__btn client-modal__btn--primary"
                            disabled={!audioFile || albums.length === 0 || isSubmitting || isUploading}
                        >
                            {isUploading ? <><span className="spinner-border spinner-border-sm me-2" />Завантаження...</> : 'Завантажити'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};