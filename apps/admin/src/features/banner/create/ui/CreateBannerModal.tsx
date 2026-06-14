'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
    usePostApiAdminBanners,
    postApiFilesUpload,
    getApiAdminArtistsAutocomplete,
    getApiAdminGenresAutocomplete, // 🎯 Імпортуємо автокомплит жанрів
    type CreateBannerCommand
} from '@repo/api/admin.ts';
import { ALLOWED_COUNTRIES } from '@/shared/config/countries';

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void; }

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

export const CreateBannerModal = ({ isOpen, onClose, onSuccess }: Props) => {
    const {
        register, handleSubmit, setError, setValue, clearErrors, reset, watch, trigger,
        formState: { errors, isSubmitting }
    } = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: { title: '', targetUrl: '', isActive: true, artistId: '', startsAtUtc: '', endsAtUtc: '', targetCountries: '', targetGenres: '' }
    });

    // Слідкуємо за датами для миттєвої крос-валідації
    const startsAtUtc = watch('startsAtUtc');
    const endsAtUtc = watch('endsAtUtc');

    // Тригеримо взаємну перевірку полей при зміні будь-якого з них
    useEffect(() => {
        if (startsAtUtc || endsAtUtc) {
            trigger(['startsAtUtc', 'endsAtUtc']);
        }
    }, [startsAtUtc, endsAtUtc, trigger]);

    // ─── Стейты для автокомплита артистов ───────────────────
    const [artistSearch, setArtistSearch] = useState('');
    const [artistsOptions, setArtistsOptions] = useState<{ id: string; name: string }[]>([]);
    const [isArtistsLoading, setIsArtistsLoading] = useState(false);
    const [isArtistDropdownOpen, setIsArtistDropdownOpen] = useState(false);

    // ─── Стейты для тегування та пошуку жанрів ──────────────
    const [genreSearch, setGenreSearch] = useState('');
    const [genreOptions, setGenreOptions] = useState<string[]>([]);
    const [isGenresLoading, setIsGenresLoading] = useState(false);
    const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

    // ─── Стейты для зображення ──────────────────────────────
    const [bannerFileId, setBannerFileId] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { mutateAsync: createBanner, isPending } = usePostApiAdminBanners();

    // Автокомплит артистів
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

                // Безпечно мапимо рядки або об'єкти жанрів
                const mapped = list.map((g: any) => typeof g === 'string' ? g : (g.name || g.title || ''));
                // Фільтруємо ті, що вже обрані адміном
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
            setUploadError('Failed to upload image assets.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = useCallback(() => {
        reset(); setBannerFileId(null); setPreviewUrl(null); setUploadError(null);
        setArtistSearch(''); setGenreSearch(''); setSelectedGenres([]); onClose();
    }, [reset, onClose]);

    const onSubmit = async (values: FormValues) => {
        if (!bannerFileId) {
            setError('root', { message: 'Please upload a banner image.' });
            return;
        }

        const formatUtcString = (localDateTime: string) => {
            if (!localDateTime) return null;
            const date = new Date(localDateTime);
            return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
        };

        const body: CreateBannerCommand = {
            title: values.title || null,
            targetUrl: values.targetUrl || null,
            bannerFileId,
            isActive: values.isActive,
            artistId: values.artistId || null,
            startsAtUtc: formatUtcString(values.startsAtUtc),
            endsAtUtc: formatUtcString(values.endsAtUtc),
            targetCountries: values.targetCountries || null,
            targetGenres: values.targetGenres || null, // Сервер отримає чистий рядок "Pop, Rock"
        };

        try {
            await createBanner({ data: body });
            onSuccess();
            handleClose();
        } catch (error: any) {
            const serverErrors = error.response?.data?.errors;
            if (serverErrors) {
                Object.keys(serverErrors).forEach((field) => {
                    const key = (field.charAt(0).toLowerCase() + field.slice(1)) as keyof FormValues;
                    setError(key, { type: 'server', message: serverErrors[field]?.[0] });
                });
            } else {
                setError('root', { message: 'Failed to deploy campaign asset.' });
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">
                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold text-cyan">Create Campaign Banner</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={handleClose} />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="modal-body p-4" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
                            {errors.root && <div className="alert alert-danger py-2 mb-3">{errors.root.message}</div>}

                            <div className="mb-4">
                                <label className="form-label admin-text small fw-bold">BANNER IMAGE *</label>
                                <div className="rounded overflow-hidden bg-secondary d-flex align-items-center justify-content-center mb-2 position-relative" style={{ width: '100%', height: 180, cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                                    {previewUrl ? <img src={previewUrl} alt="Preview" className="w-100 h-100 object-fit-cover" /> : <span className="text-muted small">➕ Click to upload image</span>}
                                    {isUploading && <div className="position-absolute w-100 h-100 bg-dark bg-opacity-70 d-flex align-items-center justify-content-center"><div className="spinner-border text-primary" /></div>}
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
                                    <label className="form-label admin-text small fw-bold">EXTERNAL TARGET URL</label>
                                    <input type="text" className="form-control admin-login__input" placeholder="https://... (optional)" {...register('targetUrl')} />
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
                                        <input type="checkbox" className="form-check-input" id="create-isActive" {...register('isActive')} />
                                        <label className="form-check-label text-white fw-semibold" htmlFor="create-isActive">Deploy Immediately</label>
                                    </div>
                                </div>
                            </div>

                            {/* 🚨 1) НАША КАСТОМНА КРОС-ВАЛІДАЦІЯ ДАТ НА ЛЕТУ */}
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
                                    <select className={`form-select admin-login__input text-white ${errors.targetCountries ? 'is-invalid' : ''}`} {...register('targetCountries', { required: 'Target country selection is required' })}>
                                        <option value="">Select country...</option>
                                        {ALLOWED_COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                    {errors.targetCountries && <div className="invalid-feedback d-block">{errors.targetCountries.message}</div>}
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
                                        placeholder="Type genre name (e.g. Rock, Pop)..."
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
                                    {/* Приховане обов'язкове поле для валідації форми */}
                                    <input type="hidden" {...register('targetGenres', { required: 'Please attach at least one genre parameter.' })} />
                                    {errors.targetGenres && <div className="text-danger small mt-1">{errors.targetGenres.message}</div>}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer border-0 p-4">
                            <button type="button" className="btn btn-admin-dark px-4" onClick={handleClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-5 fw-bold" disabled={isPending || isSubmitting || isUploading}>Deploy Banner</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
