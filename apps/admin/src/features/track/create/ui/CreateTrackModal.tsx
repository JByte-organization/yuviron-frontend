'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { ArtistRole, usePostApiAdminTracks, VisibilityStatus, postApiFilesUpload } from '@repo/api';
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
    const [audioFileId,      setAudioFileId]      = useState<string | null>(null);
    const [isAudioUploading, setIsAudioUploading] = useState(false);
    const [audioUploadError, setAudioUploadError] = useState<string | null>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);

    const [coverFileId, setCoverFileId] = useState<string | null>(null);
    const [previewUrl,  setPreviewUrl]  = useState<string | null>(null);
    const [isCoverUploading, setIsCoverUploading] = useState(false);
    const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const { mutateAsync: createTrack, isPending } = usePostApiAdminTracks();

    const handleAudioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsAudioUploading(true);
        setAudioUploadError(null);
        try {
            const res = await postApiFilesUpload({ file });
            const data = res as { fileId?: string; url?: string };
            if (!data.fileId) throw new Error('No fileId in response');
            setAudioFileId(data.fileId);
        } catch {
            setAudioUploadError('Failed to upload audio. Please try again.');
        } finally {
            setIsAudioUploading(false);
        }
    };

    const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsCoverUploading(true);
        setCoverUploadError(null);
        try {
            const res = await postApiFilesUpload({ file });
            const data = res as { fileId?: string; url?: string };
            if (!data.fileId) throw new Error('No fileId in response');
            setCoverFileId(data.fileId);
            setPreviewUrl(data.url ?? null);
        } catch {
            setCoverUploadError('Failed to upload image. Please try again.');
        } finally {
            setIsCoverUploading(false);
        }
    };

    const handleClose = () => {
        reset();
        setAlbum([]); setArtists([]); setGenres([]); setMoods([]);
        setAudioFileId(null); setAudioUploadError(null);
        setCoverFileId(null); setPreviewUrl(null); setCoverUploadError(null);
        onClose();
    };

    const onSubmit = async (values: FormValues) => {
        if (!album[0]) {
            setError('root', { message: 'Please select an album.' });
            return;
        }

        if (!audioFileId) {
            setError('root', { message: 'Please upload an audio file.' });
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
                    audioFileId:      audioFileId,
                    coverFileId:      coverFileId ?? null,
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
            reset();
            setAlbum([]); setArtists([]); setGenres([]); setMoods([]);
            setAudioFileId(null); setCoverFileId(null); setPreviewUrl(null);
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

                            {/* Audio */}
                            <div className="mb-4">
                                <label className="form-label admin-text small fw-bold">AUDIO FILE *</label>
                                <div
                                    className={`upload-input ${audioFileId ? 'border-success' : ''}`}
                                    onClick={() => audioInputRef.current?.click()}
                                    style={{ cursor: 'pointer', minHeight: '38px' }}
                                >
                                    <p className="mb-0 small mt-1 text-center">
                                        {audioFileId ? 'Audio uploaded' : 'Click to upload audio file'}
                                    </p>
                                </div>
                                <input ref={audioInputRef} type="file" accept="audio/*" className="d-none" onChange={handleAudioChange} />
                                {isAudioUploading && <p className="text-info small mt-1">Uploading...</p>}
                                {audioUploadError && <p className="text-danger small mt-1">{audioUploadError}</p>}
                                {audioFileId && !audioUploadError && <p className="text-success small mt-1">Audio uploaded successfully</p>}
                            </div>

                            {/* Cover */}
                            <div className="mb-4">
                                <label className="form-label admin-text small fw-bold">COVER IMAGE</label>
                                <div
                                    className={`upload-input ${coverFileId ? 'border-success' : ''}`}
                                    onClick={() => coverInputRef.current?.click()}
                                    style={{ cursor: 'pointer', minHeight: '38px' }}
                                >
                                    {previewUrl
                                        ? <img src={previewUrl} alt="cover preview" className="img-fluid rounded" style={{ maxHeight: '80px' }} />
                                        : <p className="mb-0 small mt-1 text-center">Click to upload</p>
                                    }
                                </div>
                                <input ref={coverInputRef} type="file" accept="image/*" className="d-none" onChange={handleCoverChange} />
                                {isCoverUploading && <p className="text-info small mt-1">Uploading...</p>}
                                {coverUploadError && <p className="text-danger small mt-1">{coverUploadError}</p>}
                                {coverFileId && !coverUploadError && <p className="text-success small mt-1">Cover uploaded</p>}
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
                            <button type="button" className="btn btn-admin-dark px-4" onClick={handleClose}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary px-5 fw-bold"
                                disabled={isPending || isSubmitting || isAudioUploading || isCoverUploading}
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