'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import {
    useGetApiAdminBannersId,
    usePutApiAdminBannersId,
    postApiFilesUpload,
    getApiAdminArtistsAutocomplete,
    getApiAdminGenresAutocomplete,
    getGetApiAdminBannersIdQueryKey,
    type BannerListItemDto,
    type BannerDetailsDto,
    type UpdateBannerCommand,
} from '@repo/api/admin.ts';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import { ALLOWED_COUNTRIES } from '@/shared/config/countries';

interface Props { banner: BannerListItemDto | null; isOpen: boolean; onClose: () => void; onSuccess: () => void; }

type FormValues = {
    title: string;
    targetUrl: string;
    isActive: boolean;
    artistId: string;
    startsAtUtc: string;
    endsAtUtc: string;
    targetCountries: string;
    targetGenres: string;
};

const formatInputDate = (isoString?: string | null): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

export const EditBannerModal = ({ banner, isOpen, onClose, onSuccess }: Props) => {
    const queryClient = useQueryClient();
    const {
        register, handleSubmit, setError, setValue, clearErrors, reset, watch, trigger,
        formState: { errors, isSubmitting }
    } = useForm<FormValues>({ mode: 'onChange' });

    const bannerId = banner?.id ?? '';

    const startsAtUtc = watch('startsAtUtc');
    const endsAtUtc = watch('endsAtUtc');

    useEffect(() => {
        if (startsAtUtc || endsAtUtc) {
            trigger(['startsAtUtc', 'endsAtUtc']);
        }
    }, [startsAtUtc, endsAtUtc, trigger]);

    const [artistSearch, setArtistSearch] = useState('');
    const [artistsOptions, setArtistsOptions] = useState<{ id: string; name: string }[]>([]);
    const [isArtistsLoading, setIsArtistsLoading] = useState(false);
    const [isArtistDropdownOpen, setIsArtistDropdownOpen] = useState(false);

    const [genreSearch, setGenreSearch] = useState('');
    const [genreOptions, setGenreOptions] = useState<string[]>([]);
    const [isGenresLoading, setIsGenresLoading] = useState(false);
    const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

    const [bannerFileId, setBannerFileId] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: detailsRaw, isLoading } = useGetApiAdminBannersId(bannerId, {
        query: { queryKey: getGetApiAdminBannersIdQueryKey(bannerId), enabled: isOpen && !!bannerId },
    });

    const { mutateAsync: updateBanner, isPending } = usePutApiAdminBannersId();
    const details = (detailsRaw as { data?: BannerDetailsDto } | undefined)?.data ?? detailsRaw as BannerDetailsDto | undefined;

    useEffect(() => {
        if (artistSearch.trim().length < 3) {
            setArtistsOptions([]);
            setIsArtistDropdownOpen(false);
            return;
        }
        const timer = setTimeout(async () => {
            setIsArtistsLoading(true);
            try {
                const res = await getApiAdminArtistsAutocomplete({ searchTerm: artistSearch, limit: 5 });
                const raw = res as any[] | { data?: any[] };
                const list = Array.isArray(raw) ? raw : (raw.data ?? []);
                setArtistsOptions(list.map((a: any) => ({ id: a.id, name: a.name || '—' })));
                setIsArtistDropdownOpen(list.length > 0);
            } catch {
                setArtistsOptions([]);
            } finally {
                setIsArtistsLoading(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [artistSearch]);

    useEffect(() => {
        if (genreSearch.trim().length < 2) {
            setGenreOptions([]);
            setIsGenreDropdownOpen(false);
            return;
        }
        const timer = setTimeout(async () => {
            setIsGenresLoading(true);
            try {
                const res = await getApiAdminGenresAutocomplete({ searchTerm: genreSearch, limit: 5 });
                const raw = res as any[] | { data?: any[] };
                const list = Array.isArray(raw) ? raw : (raw.data ?? []);
                const mapped = list.map((g: any) => typeof g === 'string' ? g : (g.name || g.title || ''));
                setGenreOptions(mapped.filter((g: string) => g && !selectedGenres.includes(g)));
                setIsGenreDropdownOpen(mapped.length > 0);
            } catch {
                setGenreOptions([]);
            } finally {
                setIsGenresLoading(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [genreSearch, selectedGenres]);

    useEffect(() => {
        if (!details) return;
        reset({
            title: details.title ?? '',
            targetUrl: details.targetUrl ?? '',
            isActive: details.isActive ?? true,
            artistId: details.artistId ?? '',
            startsAtUtc: formatInputDate(details.startsAtUtc),
            endsAtUtc: formatInputDate(details.endsAtUtc),
            targetCountries: details.targetCountries ?? '',
            targetGenres: details.targetGenres ?? '',
        });

        setPreviewUrl(getImageUrl(details.bannerUrl));
        setArtistSearch(details.artistName ?? '');

        if (details.targetGenres) {
            setSelectedGenres(details.targetGenres.split(',').map(g => g.trim()).filter(Boolean));
        } else {
            setSelectedGenres([]);
        }
    }, [details, reset]);

    const handleSelectArtist = (artist: { id: string; name: string }) => {
        setValue('artistId', artist.id, { shouldValidate: true });
        setArtistSearch(artist.name);
        setIsArtistDropdownOpen(false);
        clearErrors('artistId');
    };

    const handleAddGenre = (genre: string) => {
        const nextGenres = [...selectedGenres, genre];
        setSelectedGenres(nextGenres);
        setValue('targetGenres', nextGenres.join(', '), { shouldValidate: true });
        setGenreSearch('');
        setIsGenreDropdownOpen(false);
        clearErrors('targetGenres');
    };

    const handleRemoveGenre = (genre: string) => {
        const nextGenres = selectedGenres.filter(g => g !== genre);
        setSelectedGenres(nextGenres);
        setValue('targetGenres', nextGenres.length > 0 ? nextGenres.join(', ') : '', { shouldValidate: true });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true); setUploadError(null);
        try {
            const res = await postApiFilesUpload({ file });
            const data = res as { fileId?: string; url?: string };
            if (!data.fileId) throw new Error();
            setBannerFileId(data.fileId);
            setPreviewUrl(data.url ?? null);
        } catch {
            setUploadError('Failed to replace background layout.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = useCallback(() => {
        reset(); setBannerFileId(null); setPreviewUrl(null); setUploadError(null);
        setArtistSearch(''); setGenreSearch(''); setSelectedGenres([]); onClose();
    }, [reset, onClose]);

    const onSubmit = async (values: FormValues) => {
        if (!bannerId) return;

        const formatUtcString = (localDateTime: string) => {
            if (!localDateTime) return null;
            const date = new Date(localDateTime);
            return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
        };

        const body: UpdateBannerCommand = {
            bannerId,
            title: values.title || null,
            targetUrl: values.targetUrl || null,
            bannerFileId: bannerFileId ?? null,
            isActive: values.isActive,
            artistId: values.artistId || null,
            startsAtUtc: formatUtcString(values.startsAtUtc),
            endsAtUtc: formatUtcString(values.endsAtUtc),
            targetCountries: values.targetCountries || null,
            targetGenres: values.targetGenres || null,
        };

        try {
            await updateBanner({ id: bannerId, data: body });
            await queryClient.invalidateQueries({ queryKey: getGetApiAdminBannersIdQueryKey(bannerId) });
            onSuccess();
            handleClose();
        } catch {
            setError('root', { message: 'Failed to synchronize updated assets with core API.' });
        }
    };

    if (!isOpen || !banner) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">
                    <div className="modal-header border-secondary p-4">
                        <div>
                            <h5 className="modal-title fw-bold text-cyan mb-0">Edit Campaign Banner</h5>
                            <small className="text-secondary">Entity UUID: {banner.id}</small>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={handleClose} />
                    </div>

                    {isLoading ? (
                        <div className="modal-body p-5 text-center">
                            <div className="spinner-border text-info" />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="modal-body p-4" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
                                {errors.root && <div className="alert alert-danger py-2 mb-3">{errors.root.message}</div>}

                                <div className="mb-4">
                                    <label className="form-label admin-text small fw-bold">BANNER IMAGE ASSET</label>
                                    <div className="rounded overflow-hidden bg-secondary d-flex align-items-center justify-content-center mb-3 position-relative" style={{ width: '100%', height: 180, cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                                        {previewUrl ? <img src={previewUrl} alt="Preview" className="w-100 h-100 object-fit-cover" /> : <span className="text-muted small">No matrix loaded</span>}
                                        {isUploading && <div className="position-absolute bg-dark bg-opacity-70 w-100 h-100 d-flex align-items-center justify-content-center"><div className="spinner-border text-primary" /></div>}
                                    </div>
                                    <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="d-none" onChange={handleFileChange} />
                                    {uploadError && <p className="text-danger small mt-1">{uploadError}</p>}
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label admin-text small fw-bold">CAMPAIGN TITLE</label>
                                        <input type="text" className="form-control admin-login__input" {...register('title')} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label admin-text small fw-bold">REDIRECT TARGET URL / GUID *</label>
                                        <input type="text" className="form-control admin-login__input font-monospace" {...register('targetUrl', { required: true })} />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3 position-relative">
                                        <label className="form-label admin-text small fw-bold">LINKED ARTIST PROFILE</label>
                                        <input
                                            type="text"
                                            className="form-control admin-login__input"
                                            placeholder="Search artist..."
                                            value={artistSearch}
                                            onChange={(e) => { setArtistSearch(e.target.value); setValue('artistId', ''); }}
                                            onBlur={() => setTimeout(() => setIsArtistDropdownOpen(false), 200)}
                                            autoComplete="off"
                                        />
                                        {isArtistsLoading && <div className="position-absolute end-0 top-50 translate-middle-y pe-4 pt-3"><div className="spinner-border spinner-border-sm text-info" /></div>}
                                        {isArtistDropdownOpen && artistsOptions.length > 0 && (
                                            <ul className="list-unstyled mb-0 position-absolute w-100 rounded border border-secondary shadow current-dropdown" style={{ top: '100%', zIndex: 1200, backgroundColor: '#2a2f3d', maxHeight: 150, overflowY: 'auto' }}>
                                                {artistsOptions.map(opt => (
                                                    <li key={opt.id} className="px-3 py-2 text-white small select-item" style={{ cursor: 'pointer' }} onMouseDown={() => handleSelectArtist(opt)}>
                                                        <span className="fw-semibold">{opt.name}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <input type="hidden" {...register('artistId')} />
                                    </div>

                                    <div className="col-md-6 mb-3 d-flex align-items-center pt-4">
                                        <div className="form-check form-switch">
                                            <input type="checkbox" className="form-check-input" id="edit-isActive" {...register('isActive')} />
                                            <label className="form-check-label text-white fw-semibold" htmlFor="edit-isActive">Campaign Active</label>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label admin-text small fw-bold">CAMPAIGN STARTS (LOCAL TIME)</label>
                                        <input
                                            type="datetime-local"
                                            className={`form-select admin-login__input text-white ${errors.startsAtUtc ? 'is-invalid' : ''}`}
                                            {...register('startsAtUtc', {
                                                validate: (value, formValues) => {
                                                    if (value && formValues.endsAtUtc && new Date(value) >= new Date(formValues.endsAtUtc)) {
                                                        return 'Дата початку не може бути пізнішою або рівною даті завершення!';
                                                    }
                                                    return true;
                                                }
                                            })}
                                        />
                                        {errors.startsAtUtc && <div className="invalid-feedback d-block">{errors.startsAtUtc.message}</div>}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label admin-text small fw-bold">CAMPAIGN ENDS (LOCAL TIME)</label>
                                        <input
                                            type="datetime-local"
                                            className={`form-select admin-login__input text-white ${errors.endsAtUtc ? 'is-invalid' : ''}`}
                                            {...register('endsAtUtc', {
                                                validate: (value, formValues) => {
                                                    if (value && formValues.startsAtUtc && new Date(value) <= new Date(formValues.startsAtUtc)) {
                                                        return 'Дата завершення не може бути ранішою або рівною даті початку!';
                                                    }
                                                    return true;
                                                }
                                            })}
                                        />
                                        {errors.endsAtUtc && <div className="invalid-feedback d-block">{errors.endsAtUtc.message}</div>}
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label admin-text small fw-bold">TARGET COUNTRY *</label>
                                        <select className="form-select admin-login__input text-white" {...register('targetCountries', { required: true })}>
                                            <option value="">Select country...</option>
                                            {ALLOWED_COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                        </select>
                                    </div>

                                    <div className="col-md-6 mb-3 position-relative">
                                        <label className="form-label admin-text small fw-bold">GENRE TARGETING *</label>

                                        <div className="d-flex flex-wrap gap-1.5 mb-2">
                                            {selectedGenres.map(g => (
                                                <span key={g} className="badge bg-secondary border border-info border-opacity-20 text-cyan d-inline-flex align-items-center gap-2 py-1.5 px-2.5 small rounded-pill">
                                                    {g}
                                                    <i className="bi bi-x cursor-pointer text-white-50" onClick={() => handleRemoveGenre(g)} style={{ fontSize: '12px' }} />
                                                </span>
                                            ))}
                                        </div>

                                        <input
                                            type="text"
                                            className={`form-control admin-login__input ${errors.targetGenres ? 'is-invalid' : ''}`}
                                            placeholder="Search genre context..."
                                            value={genreSearch}
                                            onChange={(e) => setGenreSearch(e.target.value)}
                                            onBlur={() => setTimeout(() => setIsGenreDropdownOpen(false), 200)}
                                            autoComplete="off"
                                        />
                                        {isGenresLoading && <div className="position-absolute end-0 top-50 translate-middle-y pe-4 pt-4"><div className="spinner-border spinner-border-sm text-info" /></div>}
                                        {isGenreDropdownOpen && genreOptions.length > 0 && (
                                            <ul className="list-unstyled mb-0 position-absolute w-100 rounded border border-secondary shadow current-dropdown" style={{ top: '100%', zIndex: 1200, backgroundColor: '#2a2f3d', maxHeight: 150, overflowY: 'auto' }}>
                                                {genreOptions.map(g => (
                                                    <li key={g} className="px-3 py-2 text-white small select-item" style={{ cursor: 'pointer' }} onMouseDown={() => handleAddGenre(g)}>
                                                        <span className="fw-semibold">＋ {g}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <input type="hidden" {...register('targetGenres', { required: 'Please select genres context' })} />
                                        {errors.targetGenres && <div className="invalid-feedback d-block">{errors.targetGenres.message}</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer border-0 p-4">
                                <button type="button" className="btn btn-admin-dark px-4" onClick={handleClose}>Cancel</button>
                                <button type="submit" className="btn btn-primary px-5 fw-bold" disabled={isPending || isSubmitting || isUploading}>Save Changes</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
