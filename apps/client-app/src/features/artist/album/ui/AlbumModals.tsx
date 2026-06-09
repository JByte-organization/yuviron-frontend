'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
    AppPermission,
    getGetApiStudioArtistAlbumsIdTracksQueryKey,
    ReleaseType,
    useDeleteApiStudioArtistAlbumsId,
    useGetApiStudioArtistAlbumsIdTracks,
    usePostApiStudioArtistAlbums,
    type StudioAlbumTrackDto,
} from '@repo/api/artist.ts';
import { usePostApiFilesUpload } from '@repo/api/client.ts';
import { TrackRow, type TrackRowData } from '@/entities/track/ui/TrackRow';
import type { AlbumCardData } from '@/entities/album/ui/AlbumCard';
import { useCurrentArtistId } from '@/entities/artist/model/currentArtist';

const extractFileId = (res: unknown): string | null => {
    const r = res as { fileId?: string; data?: { fileId?: string } } | null;
    return r?.data?.fileId ?? r?.fileId ?? null;
};

// ══════════════════════════════════════════════════════════
// CREATE ALBUM MODAL
// ══════════════════════════════════════════════════════════
interface CreateProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type CreateFormValues = {
    title: string;
    releaseDate: string;
    releaseType: ReleaseType;
};

export const CreateAlbumModal = ({ isOpen, onClose, onSuccess }: CreateProps) => {
    const artistId = useCurrentArtistId();
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateFormValues>({
        defaultValues: { title: '', releaseDate: '', releaseType: ReleaseType.Album },
    });
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [coverFile,    setCoverFile]    = useState<File | null>(null);
    const [error,        setError]        = useState<string | null>(null);
    const coverRef = useRef<HTMLInputElement>(null);

    const { mutateAsync: uploadFile } = usePostApiFilesUpload();
    const { mutateAsync: createAlbum } = usePostApiStudioArtistAlbums();

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const handleClose = () => {
        reset();
        setCoverFile(null);
        setCoverPreview(null);
        setError(null);
        onClose();
    };

    const onSubmit = async (values: CreateFormValues) => {
        if (!artistId) return;
        setError(null);
        try {
            const coverFileId = coverFile
                ? extractFileId(await uploadFile({ data: { file: coverFile } }))
                : null;
            await createAlbum({
                data: {
                    artistId,
                    title: values.title.trim(),
                    coverFileId,
                    releaseType: values.releaseType,
                    releaseDate: values.releaseDate ? new Date(values.releaseDate).toISOString() : null,
                    requiredPermission: AppPermission.StudioArtistManage,
                },
            });
            onSuccess();
            handleClose();
        } catch {
            setError('Не вдалося створити альбом. Спробуйте ще раз.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="client-modal-backdrop">
            <div className="client-modal modal-dialog-sm">
                <div className="client-modal__header">
                    <h2 className="client-modal__title">Створити альбом</h2>
                    <button className="client-modal__close" onClick={handleClose}>
                        <i className="bi bi-x-lg" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="client-modal__body">

                        <div className="row g-4 align-items-start mb-4">
                            <div className="col-auto">
                                <div
                                    className="upload-track-modal__cover"
                                    onClick={() => coverRef.current?.click()}
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
                                <label className="client-modal__field-label">Назва альбому *</label>
                                <input
                                    type="text"
                                    className={`client-modal__input${errors.title ? ' client-modal__input--error' : ''}`}
                                    placeholder="Введіть назву..."
                                    {...register('title', { required: "Назва обов'язкова" })}
                                />
                                {errors.title && <p className="client-modal__field-error">{errors.title.message}</p>}

                                <label className="client-modal__field-label mt-3">Тип релізу</label>
                                <select className="client-modal__input" {...register('releaseType')}>
                                    <option value={ReleaseType.Single}>Сингл</option>
                                    <option value={ReleaseType.EP}>EP</option>
                                    <option value={ReleaseType.Album}>Альбом</option>
                                </select>

                                <label className="client-modal__field-label mt-3">Дата релізу</label>
                                <input
                                    type="date"
                                    className="client-modal__input"
                                    {...register('releaseDate')}
                                />
                            </div>
                        </div>

                        <p className="client-modal__hint">
                            Після створення альбому ви зможете додати до нього треки.
                        </p>

                    </div>

                    <div className="client-modal__footer">
                        {error && <span className="client-modal__field-error me-auto">{error}</span>}
                        <button type="button" className="client-modal__btn client-modal__btn--ghost" onClick={handleClose}>
                            Скасувати
                        </button>
                        <button type="submit" className="client-modal__btn client-modal__btn--primary" disabled={isSubmitting || !artistId}>
                            {isSubmitting ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                            Створити
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════
// ALBUM DETAIL MODAL
// ══════════════════════════════════════════════════════════
const unwrapArray = <T,>(raw: unknown): T[] => {
    if (Array.isArray(raw)) return raw as T[];
    const obj = raw as { data?: T[] } | null;
    return Array.isArray(obj?.data) ? (obj!.data as T[]) : [];
};

interface DetailProps {
    isOpen: boolean;
    album: AlbumCardData;
    onClose: () => void;
}

export const AlbumDetailModal = ({ isOpen, album, onClose }: DetailProps) => {
    const { data: tracksRaw, isLoading } = useGetApiStudioArtistAlbumsIdTracks(album.id, {
        query: { enabled: isOpen && !!album.id, queryKey: getGetApiStudioArtistAlbumsIdTracksQueryKey(album.id) },
    });

    // Формуємо чистий масив треків для таблиці
    const tracks: TrackRowData[] = useMemo(() => {
        return unwrapArray<StudioAlbumTrackDto>(tracksRaw).map((t, i) => ({
            id:          t.id ?? '',
            index:       t.position ?? i + 1,
            title:       t.title ?? 'Без назви',
            artistNames: [album.artistName].filter(Boolean),
            artistId:    '',
            albumId:     album.id,
            albumTitle:  album.title,
            addedAt:     null,
            durationMs:  t.durationMs ?? 0,
            coverUrl:    t.coverUrl,
            isSaved:     (t as any).isSaved ?? false,
        }));
    }, [tracksRaw, album]);

    if (!isOpen) return null;

    const coverSrc = album.coverUrl ?? `https://picsum.photos/seed/album-${album.id}/200/200`;

    return (
        <div className="client-modal-backdrop">
            <div className="client-modal modal-dialog-lg">
                <div className="client-modal__header">
                    <div className="d-flex align-items-center gap-3">
                        <div className="album-detail-modal__cover">
                            <img src={coverSrc} alt={album.title} />
                        </div>
                        <div>
                            <p className="album-detail-modal__label">Альбом</p>
                            <h2 className="client-modal__title mb-0">{album.title}</h2>
                            <p className="album-detail-modal__meta">{album.tracksCount} треків</p>
                        </div>
                    </div>
                    <button className="client-modal__close" onClick={onClose}>
                        <i className="bi bi-x-lg" />
                    </button>
                </div>

                <div className="client-modal__body" style={{ overflowY: 'auto', maxHeight: '60vh' }}>
                    {tracks.length === 0 ? (
                        <p className="text-muted text-center py-4 mb-0">
                            {isLoading ? 'Завантаження…' : 'У цьому альбомі ще немає треків.'}
                        </p>
                    ) : (
                        <div className="d-flex flex-column gap-1">
                            {tracks.map(track => (
                                /* 🚨 ФІКС: Передаємо сумісну сигнатуру пропсів автономного TrackRow */
                                <TrackRow
                                    key={`${track.id}-${track.isSaved}`}
                                    track={track}
                                    allTracks={tracks}
                                    sourceType="Album"
                                    sourceId={album.id}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="client-modal__footer">
                    <button className="client-modal__btn client-modal__btn--ghost" onClick={onClose}>
                        Закрити
                    </button>
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════
// DELETE ALBUM MODAL
// ══════════════════════════════════════════════════════════
interface DeleteAlbumProps {
    isOpen: boolean;
    album: AlbumCardData;
    onClose: () => void;
    onSuccess: () => void;
}

export const DeleteAlbumModal = ({ isOpen, album, onClose, onSuccess }: DeleteAlbumProps) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { mutateAsync: deleteAlbum } = useDeleteApiStudioArtistAlbumsId();

    const handleDelete = async () => {
        setError(null);
        setIsDeleting(true);
        try {
            await deleteAlbum({ id: album.id });
            onSuccess();
            onClose();
        } catch {
            setError('Не вдалося видалити альбом.');
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="client-modal-backdrop">
            <div className="client-modal modal-dialog-sm">
                <div className="client-modal__header">
                    <h2 className="client-modal__title">Видалити альбом</h2>
                    <button className="client-modal__close" onClick={onClose}>
                        <i className="bi bi-x-lg" />
                    </button>
                </div>

                <div className="client-modal__body">
                    <p className="text-muted mb-1">Ви впевнені що хочете видалити альбом?</p>
                    <p className="text-theme fw-semibold mb-0">«{album.title}»</p>
                    <p className="text-danger small mt-3 mb-0">Треки альбому не будуть видалені.</p>
                    {error && <p className="client-modal__field-error mt-2 mb-0">{error}</p>}
                </div>

                <div className="client-modal__footer">
                    <button className="client-modal__btn client-modal__btn--ghost" onClick={onClose} disabled={isDeleting}>
                        Скасувати
                    </button>
                    <button className="client-modal__btn client-modal__btn--danger" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                        Видалити
                    </button>
                </div>
            </div>
        </div>
    );
};