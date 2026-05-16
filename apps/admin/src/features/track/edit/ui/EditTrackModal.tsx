'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    useGetApiAdminTracksId,
    getGetApiAdminTracksIdQueryKey,
    usePutApiAdminTracksId,
    VisibilityStatus,
    type TrackListItemDto, ArtistRole, TrackGenreSimpleDto, TrackMoodSimpleDto, TrackArtistSimpleDto, TrackDetailsDto,
} from '@repo/api';
import { AsyncSelect, type SelectOption } from '@/shared/ui/AsyncSelect/AsyncSelect';

interface Props {
    track: TrackListItemDto | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onSearchArtists: (term: string) => Promise<SelectOption[]>;
    onSearchGenres:  (term: string) => Promise<SelectOption[]>;
    onSearchMoods:   (term: string) => Promise<SelectOption[]>;
    onSearchAlbums:  (term: string) => Promise<SelectOption[]>;
}

type FormValues = {
    title: string;
    albumPosition: number;
    audioStorageKey: string;
    coverUrl: string;
    explicit: boolean;
    visibilityStatus: string;
};

export const EditTrackModal = ({
                                   track, isOpen, onClose, onSuccess,
                                   onSearchArtists, onSearchGenres, onSearchMoods, onSearchAlbums,
                               }: Props) => {
    const {
        register, handleSubmit, setError, reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>();

    const [album,   setAlbum]   = useState<SelectOption[]>([]);
    const [artists, setArtists] = useState<SelectOption[]>([]);
    const [genres,  setGenres]  = useState<SelectOption[]>([]);
    const [moods,   setMoods]   = useState<SelectOption[]>([]);

    const trackId = track?.id ?? '';

    const { data: details, isLoading } = useGetApiAdminTracksId(trackId, {
        query: {
            queryKey: getGetApiAdminTracksIdQueryKey(trackId),
            enabled: isOpen && !!trackId,
        },
    });

    const { mutateAsync: updateTrack, isPending } = usePutApiAdminTracksId();

    useEffect(() => {
        if (!details) return;

        // Orval повертає { data: TrackDetailsDto, status: 200 }
        const d = (details as { data?: TrackDetailsDto }).data ?? details as TrackDetailsDto;

        const newAlbum: SelectOption[] = d.albumId && d.albumTitle
            ? [{ id: d.albumId, label: d.albumTitle }]
            : [];

        const newArtists: SelectOption[] = (d.artists ?? [])
            .map((a: TrackArtistSimpleDto) => ({
                id:    a.artistId ?? '',
                label: a.name     ?? '',
            }));

        const newGenres: SelectOption[] = (d.genres ?? [])
            .map((g: TrackGenreSimpleDto) => ({
                id:    g.genreId ?? '',
                label: g.name    ?? '',
            }));

        const newMoods: SelectOption[] = (d.moods ?? [])
            .map((m: TrackMoodSimpleDto) => ({
                id:    m.moodId ?? '',
                label: m.name   ?? '',
            }));

        // Всі setState разом — один ре-рендер
        setAlbum(newAlbum);
        setArtists(newArtists);
        setGenres(newGenres);
        setMoods(newMoods);

        reset({
            title:            d.title            ?? '',
            albumPosition:    (d.albumPosition ?? 0) > 0 ? d.albumPosition! : 1,
            audioStorageKey:  d.audioStorageKey  ?? '',
            coverUrl:         d.coverUrl         ?? '',
            explicit:         d.explicit         ?? false,
            visibilityStatus: d.visibilityStatus ?? VisibilityStatus.Draft,
        });
    }, [details, reset]);

    const onSubmit = async (values: FormValues) => {
        if (!trackId) return;

        if (!album[0]) {
            setError('root', { message: 'Please select an album.' });
            return;
        }

        try {
            await updateTrack({
                id: trackId,
                data: {
                    trackId,
                    albumId:          album[0].id,
                    title:            values.title,
                    albumPosition:    Number.isFinite(values.albumPosition) && values.albumPosition > 0
                        ? values.albumPosition
                        : 1,
                    audioStorageKey:  values.audioStorageKey || null,
                    coverUrl:         values.coverUrl || null,
                    explicit:         values.explicit,
                    visibilityStatus: values.visibilityStatus as any,
                    artists: artists.map(a => ({
                        id:   a.id,
                        name: a.label ?? null,
                        role: ArtistRole.Main,
                    })),
                    genreIds:  genres.map(g => g.id),
                    moodIds:   moods.map(m => m.id),
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
                setError('root', { message: `Error ${status}: Failed to update track.` });
            }
        }
    };

    if (!isOpen || !track) return null;

    const coverSrc = track.coverUrl
        ? `https://api.yuviron.com/storage/${track.coverUrl}`
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
                                    : <span>🎵</span>
                                }
                            </div>
                            <div>
                                <h5 className="modal-title fw-bold mb-0 text-cyan">Edit Track</h5>
                                <small className="text-secondary">ID: {track.id}</small>
                            </div>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} />
                    </div>

                    {isLoading ? (
                        <div className="modal-body p-5 text-center">
                            <div className="spinner-border text-info" />
                            <p className="text-secondary mt-3">Fetching track details...</p>
                        </div>
                    ) : (
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

                                {/* Album — одиночный выбор */}
                                <AsyncSelect
                                    label="ALBUM *"
                                    placeholder="Search album..."
                                    selected={album}
                                    onChange={(items) => setAlbum(items.slice(-1))}
                                    onSearch={onSearchAlbums}
                                />

                                <div className="row">
                                    {/* Status */}
                                    <div className="col-md-6 mb-4">
                                        <label className="form-label admin-text small fw-bold">STATUS</label>
                                        <select
                                            className="form-select admin-login__input text-white"
                                            {...register('visibilityStatus')}
                                        >
                                            {Object.values(VisibilityStatus).map(v => (
                                                <option key={v} value={v}>{v}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Album position */}
                                    <div className="col-md-6 mb-4">
                                        <label className="form-label admin-text small fw-bold">ALBUM POSITION</label>
                                        <input
                                            type="number"
                                            className={`form-control admin-login__input ${errors.albumPosition ? 'is-invalid' : ''}`}
                                            {...register('albumPosition', {
                                                valueAsNumber: true,
                                                min: { value: 1, message: 'Must be at least 1' },
                                            })}
                                        />
                                        {errors.albumPosition && (
                                            <div className="invalid-feedback">{errors.albumPosition.message}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Audio key */}
                                <div className="mb-4">
                                    <label className="form-label admin-text small fw-bold">AUDIO STORAGE KEY</label>
                                    <input
                                        type="text"
                                        className="form-control admin-login__input text-secondary"
                                        {...register('audioStorageKey')}
                                    />
                                </div>

                                {/* Cover */}
                                <div className="mb-4">
                                    <label className="form-label admin-text small fw-bold">COVER PATH</label>
                                    <input
                                        type="text"
                                        className="form-control admin-login__input text-secondary"
                                        {...register('coverUrl')}
                                    />
                                </div>

                                {/* Explicit */}
                                <div className="mb-4 form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="edit-explicit"
                                        {...register('explicit')}
                                    />
                                    <label className="form-check-label text-secondary small" htmlFor="edit-explicit">
                                        Explicit content
                                    </label>
                                </div>

                                <AsyncSelect
                                    label="ARTISTS"
                                    selected={artists}
                                    onChange={setArtists}
                                    onSearch={onSearchArtists}
                                />
                                <AsyncSelect
                                    label="GENRES"
                                    selected={genres}
                                    onChange={setGenres}
                                    onSearch={onSearchGenres}
                                />
                                <AsyncSelect
                                    label="MOODS"
                                    selected={moods}
                                    onChange={setMoods}
                                    onSearch={onSearchMoods}
                                />

                            </div>

                            <div className="modal-footer border-0 p-4">
                                <button type="button" className="btn btn-admin-dark px-4" onClick={onClose}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary px-5 fw-bold"
                                    disabled={isPending || isSubmitting}
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