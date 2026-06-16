'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    getGetApiStudioArtistAlbumsQueryKey,
    useGetApiStudioArtistAlbums,
} from '@repo/api/artist.ts';
import { usePostApiFilesUpload } from '@repo/api/client.ts';
import { useCurrentArtist } from '@/entities/artist/model/currentArtist';
import { useArtistPermissions } from '@/entities/artist/model/useArtistPermissions';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import { extractFileId, unwrapItems } from '@/shared/lib/unwrapApi';
import {
    getActiveBannerRequest,
    payBannerRequest,
    submitBannerRequest,
    type ActiveBannerRequestDto,
    type BannerRequestStatus,
} from '@/features/artist/marketing/api/bannerRequests';

const STATUS: Record<BannerRequestStatus, { label: string; color: string }> = {
    AwaitingPayment: { label: 'Очікує оплати', color: '#FFB347' },
    Pending: { label: 'На модерації', color: '#7AA2FF' },
    Approved: { label: 'Схвалено', color: '#2ECC71' },
    Rejected: { label: 'Відхилено', color: '#FF6B6B' },
};

type AlbumOpt = { id?: string; title?: string | null };

export const ArtistMarketingPage = () => {
    const { artistId } = useCurrentArtist();
    const { can, lockTitle } = useArtistPermissions();
    const canBanners = can('banners');

    const albumsParams = { ArtistId: artistId ?? undefined, Page: 1, PageSize: 100 };
    const { data: albumsRaw } = useGetApiStudioArtistAlbums(albumsParams, {
        query: {
            enabled: !!artistId && canBanners,
            queryKey: getGetApiStudioArtistAlbumsQueryKey(albumsParams),
        },
    });
    const albums = unwrapItems<AlbumOpt>(albumsRaw);

    const { data: active, refetch: refetchActive } = useQuery({
        queryKey: ['banner-request-active', artistId],
        queryFn: () => getActiveBannerRequest(artistId as string),
        enabled: !!artistId && canBanners,
    });

    const [albumId, setAlbumId] = useState('');
    const [title, setTitle] = useState('');
    const [durationDays, setDurationDays] = useState('7');
    const [targetCountries, setTargetCountries] = useState('');
    const [targetGenres, setTargetGenres] = useState('');
    const [bannerFile, setBannerFile] = useState<File | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [payingId, setPayingId] = useState<string | null>(null);

    const { mutateAsync: uploadFile } = usePostApiFilesUpload();

    const returnUrls = () => {
        const base = typeof window !== 'undefined' ? window.location.origin : '';
        return {
            successUrl: `${base}/artist-dashboard/marketing?status=success`,
            cancelUrl: `${base}/artist-dashboard/marketing?status=cancel`,
        };
    };

    const days = Number(durationDays);
    const formValid = !!albumId && !!bannerFile && Number.isInteger(days) && days >= 1;

    const handleSubmit = async () => {
        if (!artistId || !formValid || !bannerFile) return;
        setError(null);
        setBusy(true);
        let step = 'завантаження банера';
        try {
            const bannerFileId = extractFileId(await uploadFile({ data: { file: bannerFile } }));
            if (!bannerFileId) throw new Error('Аплоад не повернув fileId');

            step = 'створення заявки';
            const res = await submitBannerRequest({
                artistId,
                albumId,
                title: title.trim() || null,
                bannerFileId,
                durationDays: days,
                targetCountries: targetCountries.trim() || null,
                targetGenres: targetGenres.trim() || null,
                requiredPermission: 'StudioArtistManage',
                ...returnUrls(),
            });

            if (res?.checkoutUrl) {
                window.location.href = res.checkoutUrl;
                return;
            }
            await refetchActive();
            setBannerFile(null);
            setTitle('');
        } catch (e) {
            const r = (e as { response?: { status?: number; data?: unknown } })?.response;
            const data = r?.data;
            const raw =
                typeof data === 'string'
                    ? data
                    : (data as { detail?: string; title?: string })?.detail ||
                      (data as { detail?: string; title?: string })?.title ||
                      (data ? JSON.stringify(data) : '') ||
                      (e as Error)?.message ||
                      '';
            setError(
                `Не вдалося [${step}]${r?.status ? ` (HTTP ${r.status})` : ''}` +
                `${raw ? `: ${raw}` : ''}.`,
            );
        } finally {
            setBusy(false);
        }
    };

    const handlePay = async (req: ActiveBannerRequestDto) => {
        if (!artistId || !req.id) return;
        setError(null);
        setPayingId(req.id);
        try {
            const res = await payBannerRequest(req.id, { artistId, ...returnUrls() });
            if (res?.checkoutUrl) window.location.href = res.checkoutUrl;
            else setError('Не вдалося отримати посилання на оплату. Спробуйте ще раз.');
        } catch {
            setError('Не вдалося розпочати оплату заявки. Спробуйте пізніше.');
        } finally {
            setPayingId(null);
        }
    };

    if (!canBanners) {
        return (
            <div className="artist-analytics-page">
                <div className="artist-analytics-page__header">
                    <h1 className="artist-analytics-page__title">Реклама</h1>
                </div>
                <div className="artist-analytics-page__chart-block">
                    <div className="text-secondary py-4 text-center">
                        <i className="bi bi-lock me-2" />
                        {lockTitle}
                    </div>
                </div>
            </div>
        );
    }

    const st = active?.status ? STATUS[active.status] : null;

    return (
        <div className="artist-analytics-page">
            <div className="artist-analytics-page__header">
                <h1 className="artist-analytics-page__title">Реклама</h1>
            </div>

            {error && <div className="client-modal__field-error mb-3">{error}</div>}

            {active && (
                <div className="artist-analytics-page__chart-block mb-4">
                    <h2 className="artist-analytics-page__chart-title">Поточна заявка</h2>
                    <div className="artist-analytics-page__top-track mt-3">
                        {active.bannerUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={getImageUrl(active.bannerUrl) ?? undefined}
                                alt=""
                                style={{ width: 96, height: 54, objectFit: 'cover', borderRadius: 8 }}
                            />
                        ) : null}
                        <span className="artist-analytics-page__top-track-title">
                            {active.title || 'Банер'}
                            <span className="text-secondary ms-2" style={{ fontSize: 13 }}>
                                {active.durationDays ? `${active.durationDays} дн.` : ''}
                            </span>
                        </span>

                        {st && (
                            <span style={{ fontSize: 13, fontWeight: 600, color: st.color }}>
                                {st.label}
                            </span>
                        )}

                        {active.status === 'AwaitingPayment' && !active.isPaid && (
                            <button
                                className="client-modal__btn client-modal__btn--primary ms-auto"
                                disabled={payingId === active.id}
                                onClick={() => handlePay(active)}
                            >
                                {payingId === active.id ? 'Переходимо до оплати…' : 'Оплатити'}
                            </button>
                        )}
                    </div>
                    {active.status === 'Rejected' && active.adminNotes && (
                        <p className="text-secondary mt-2 mb-0" style={{ fontSize: 13 }}>
                            Причина відхилення: {active.adminNotes}
                        </p>
                    )}
                </div>
            )}

            <div className="artist-analytics-page__chart-block">
                <h2 className="artist-analytics-page__chart-title">Замовити банер</h2>
                <p className="text-secondary mt-1 mb-3" style={{ fontSize: 13 }}>
                    Банер веде на сторінку обраного альбому. Після створення заявки —
                    оплата, далі модерація адміністратором.
                </p>

                <div className="row g-3">
                    <div className="col-12 col-md-6">
                        <label className="artist-settings-page__field-label">Альбом *</label>
                        <select
                            className="client-modal__input"
                            value={albumId}
                            onChange={(e) => setAlbumId(e.target.value)}
                        >
                            <option value="">Оберіть альбом</option>
                            {albums.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.title ?? 'Без назви'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-12 col-md-6">
                        <label className="artist-settings-page__field-label">Тривалість, днів *</label>
                        <input
                            type="number"
                            min={1}
                            className="client-modal__input"
                            value={durationDays}
                            onChange={(e) => setDurationDays(e.target.value.replace(/\D/g, ''))}
                        />
                    </div>

                    <div className="col-12">
                        <label className="artist-settings-page__field-label">Назва (необов’язково)</label>
                        <input
                            type="text"
                            className="client-modal__input"
                            placeholder="Напр., Новий альбом — слухайте зараз"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="col-12">
                        <label className="artist-settings-page__field-label">Зображення банера *</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="client-modal__input"
                            onChange={(e) => setBannerFile(e.target.files?.[0] ?? null)}
                        />
                    </div>

                    <div className="col-12 col-md-6">
                        <label className="artist-settings-page__field-label">
                            Країни (через кому, необов’язково)
                        </label>
                        <input
                            type="text"
                            className="client-modal__input"
                            placeholder="UA, PL"
                            value={targetCountries}
                            onChange={(e) => setTargetCountries(e.target.value)}
                        />
                    </div>

                    <div className="col-12 col-md-6">
                        <label className="artist-settings-page__field-label">
                            Жанри (через кому, необов’язково)
                        </label>
                        <input
                            type="text"
                            className="client-modal__input"
                            placeholder="Pop, Hip-Hop"
                            value={targetGenres}
                            onChange={(e) => setTargetGenres(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    className="client-modal__btn client-modal__btn--primary mt-3"
                    disabled={!formValid || busy}
                    onClick={handleSubmit}
                >
                    {busy ? 'Створюємо заявку…' : 'Створити та оплатити'}
                </button>
                {albums.length === 0 && (
                    <p className="text-secondary mt-2 mb-0" style={{ fontSize: 13 }}>
                        Спочатку створіть альбом — банер веде на його сторінку.
                    </p>
                )}
            </div>
        </div>
    );
};
