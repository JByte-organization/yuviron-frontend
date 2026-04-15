'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { usePostApiAdminTracks, VisibilityStatus } from '@repo/api';
import { AsyncSelect, type SelectOption } from '@/shared/ui/AsyncSelect/AsyncSelect';

interface Props {
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

export const CreateTrackModal = ({
                                     isOpen, onClose, onSuccess,
                                     onSearchArtists, onSearchGenres, onSearchMoods, onSearchAlbums,
                                 }: Props) => {
    const {
        register, handleSubmit, setError, reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: {
            visibilityStatus: VisibilityStatus.Draft,
            explicit: false,
            albumPosition: 1,
        },
    });

    const [album,   setAlbum]   = useState<SelectOption[]>([]);
    const [artists, setArtists] = useState<SelectOption[]>([]);
    const [genres,  setGenres]  = useState<SelectOption[]>([]);
    const [moods,   setMoods]   = useState<SelectOption[]>([]);

    const { mutateAsync: createTrack, isPending } = usePostApiAdminTracks();

    const onSubmit = async (values: FormValues) => {
        if (!album[0]) {
            setError('root', { message: 'Please select an album.' });
            return;
        }

        try {
            await createTrack({
                data: {
                    title:            values.title,
                    albumId:          album[0].id,
                    albumPosition:    Number.isFinite(values.albumPosition) && values.albumPosition > 0
                        ? values.albumPosition
                        : 1,
                    audioStorageKey:  values.audioStorageKey || null,
                    coverUrl:         values.coverUrl || null,
                    explicit:         values.explicit,
                    visibilityStatus: values.visibilityStatus as any,
                    artistIds: artists.map(a => a.id),
                    genreIds:  genres.map(g => g.id),
                    moodIds:   moods.map(m => m.id),
                },
            });
            reset();
            setAlbum([]); setArtists([]); setGenres([]); setMoods([]);
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
                setError('root', { message: `Error ${status}: Failed to create track.` });
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">

                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold text-cyan">Create Track</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} />
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
                                    placeholder="audio/tracks/example.mp3"
                                    {...register('audioStorageKey')}
                                />
                            </div>

                            {/* Cover */}
                            <div className="mb-4">
                                <label className="form-label admin-text small fw-bold">COVER PATH</label>
                                <input
                                    type="text"
                                    className="form-control admin-login__input text-secondary"
                                    placeholder="covers/example.jpg"
                                    {...register('coverUrl')}
                                />
                            </div>

                            {/* Explicit */}
                            <div className="mb-4 form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="create-explicit"
                                    {...register('explicit')}
                                />
                                <label className="form-check-label text-secondary small" htmlFor="create-explicit">
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
                                {isPending ? 'Creating...' : 'Create Track'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};