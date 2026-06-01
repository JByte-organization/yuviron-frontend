'use client';

import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TrackRow, type TrackRowData } from '@/entities/track/ui/TrackRow';
import type { AlbumCardData } from '@/entities/album/ui/AlbumCard';

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
};

export const CreateAlbumModal = ({ isOpen, onClose, onSuccess }: CreateProps) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateFormValues>();
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [coverFile,    setCoverFile]    = useState<File | null>(null);
    const coverRef = useRef<HTMLInputElement>(null);

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
        onClose();
    };

    const onSubmit = async (values: CreateFormValues) => {
        console.log('create album', values, coverFile);
        // TODO:
        // 1. POST /api/files/upload (coverFile) → coverPath
        // 2. POST /api/artist-dashboard/albums { title, releaseDate, coverPath }
        await new Promise(r => setTimeout(r, 500));
        onSuccess();
        handleClose();
    };

    if (!isOpen) return null;

    return (
        <div className="client-modal-overlay">
            <div className="client-modal client-modal--sm">
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
                        <button type="button" className="client-modal__btn client-modal__btn--ghost" onClick={handleClose}>
                            Скасувати
                        </button>
                        <button type="submit" className="client-modal__btn client-modal__btn--primary" disabled={isSubmitting}>
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
const MOCK_ALBUM_TRACKS: TrackRowData[] = [
    { id: 't1', index: 1, title: 'THE CONTORTIONIST', artistNames: ['МузикаВітч'], artistId: 'a1', albumId: 'al1', albumTitle: null, addedAt: null, durationMs: 210000, coverUrl: null },
    { id: 't2', index: 2, title: 'Глубоко',           artistNames: ['МузикаВітч'], artistId: 'a1', albumId: 'al1', albumTitle: null, addedAt: null, durationMs: 195000, coverUrl: null },
    { id: 't3', index: 3, title: 'Superman',          artistNames: ['МузикаВітч'], artistId: 'a1', albumId: 'al1', albumTitle: null, addedAt: null, durationMs: 224000, coverUrl: null },
];

interface DetailProps {
    isOpen: boolean;
    album: AlbumCardData;
    onClose: () => void;
}

export const AlbumDetailModal = ({ isOpen, album, onClose }: DetailProps) => {
    const [currentTrack, setCurrentTrack] = useState<string | null>(null);

    if (!isOpen) return null;

    const coverSrc = album.coverUrl ?? `https://picsum.photos/seed/album-${album.id}/200/200`;

    return (
        <div className="client-modal-overlay">
            <div className="client-modal client-modal--lg">
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
                    {MOCK_ALBUM_TRACKS.map(track => (
                        <TrackRow
                            key={track.id}
                            track={track}
                            isPlaying={currentTrack === track.id}
                            onClick={id => setCurrentTrack(id === currentTrack ? null : id)}
                        />
                    ))}
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

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            console.log('delete album', album.id);
            // TODO: DELETE /api/artist-dashboard/albums/{albumId}
            await new Promise(r => setTimeout(r, 500));
            onSuccess();
            onClose();
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="client-modal-overlay">
            <div className="client-modal client-modal--xs">
                <div className="client-modal__header">
                    <h2 className="client-modal__title">Видалити альбом</h2>
                    <button className="client-modal__close" onClick={onClose}>
                        <i className="bi bi-x-lg" />
                    </button>
                </div>

                <div className="client-modal__body">
                    <p className="text-muted mb-1">Ви впевнені що хочете видалити альбом?</p>
                    <p className="text-white fw-semibold mb-0">«{album.title}»</p>
                    <p className="text-danger small mt-3 mb-0">Треки альбому не будуть видалені.</p>
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