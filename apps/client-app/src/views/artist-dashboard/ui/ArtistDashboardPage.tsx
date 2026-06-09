'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import {
    getGetApiStudioArtistProfileArtistIdQueryKey,
    getGetApiStudioArtistStatsQueryKey,
    getGetApiStudioArtistTracksQueryKey,
    getGetApiStudioArtistAlbumsQueryKey,
    useGetApiStudioArtistProfileArtistId,
    useGetApiStudioArtistStats,
    useGetApiStudioArtistTracks,
    useGetApiStudioArtistAlbums,
    type StudioArtistProfileDto,
    type ArtistAnalyticsDto,
} from '@repo/api/artist.ts';
import type {
    StudioAlbumListItemFlex,
    StudioTrackListItemFlex,
} from '@/entities/artist/model/studioListDtoFlex';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { TrackCard, type TrackCardData } from '@/entities/track/ui/TrackCard';
import { AlbumCard, type AlbumCardData } from '@/entities/album/ui/AlbumCard';
import { ShowAllButton } from '@/shared/ui/ShowAllButton';
import { useAvatarColor } from '@/shared/lib/useAvatarColor';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import { useCurrentArtistId } from '@/entities/artist/model/currentArtist';

// Кастомний mutator може віддати тіло напряму або обгорнуте в { data } — читаємо обидва.
const unwrap = <T,>(raw: unknown): T | undefined => {
    if (!raw) return undefined;
    const obj = raw as { data?: T };
    return (obj.data ?? (raw as T)) as T;
};

// Paginated-список: items лежать у raw.items або raw.data.items.
const unwrapItems = <T,>(raw: unknown): T[] => {
    if (!raw) return [];
    const obj = raw as { items?: T[]; data?: { items?: T[] } };
    return obj.items ?? obj.data?.items ?? [];
};

const formatCount = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' млн';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + ' тис';
    return String(n);
};

// ══════════════════════════════════════════════════════════
// HEADER
// ══════════════════════════════════════════════════════════
interface HeaderProps {
    profile?: StudioArtistProfileDto;
    stats?: ArtistAnalyticsDto;
}

const ArtistDashboardHeader = ({ profile, stats }: HeaderProps) => {
    const [bioExpanded, setBioExpanded] = useState(false);

    const avatarUrl = getImageUrl(profile?.details?.avatarUrl);
    const bannerUrl = getImageUrl(profile?.details?.bannerUrl);
    const bio = profile?.details?.bio;
    const isVerified = profile?.verificationStatus === 'Verified';
    const dominantColor = useAvatarColor(bannerUrl ? null : avatarUrl);

    const statItems = [
        { value: stats?.totalTracks ?? 0, label: 'Треки' },
        { value: stats?.totalAlbums ?? 0, label: 'Альбоми' },
        { value: formatCount(stats?.monthlyListeners ?? 0), label: 'Слухачів' },
        { value: formatCount(Number(stats?.totalPlays ?? 0)), label: 'Прослухувань' },
    ];

    return (
        <div className="artist-dashboard-header">
            {/* Банер або градієнт */}
            <div
                className="artist-dashboard-header__banner"
                style={bannerUrl
                    ? { backgroundImage: `url(${bannerUrl})` }
                    : { background: `linear-gradient(135deg, ${dominantColor} 0%, transparent 100%)` }
                }
            />
            <div className="artist-dashboard-header__overlay" />

            <div className="artist-dashboard-header__content">
                {/* Аватарка */}
                <div className="artist-dashboard-header__avatar-wrap">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={profile?.name ?? ''}
                            className="artist-dashboard-header__avatar"
                        />
                    ) : (
                        <span className="artist-dashboard-header__avatar artist-dashboard-header__avatar--placeholder">
                            <i className="bi bi-person" />
                        </span>
                    )}
                    {isVerified && (
                        <span className="artist-dashboard-header__verified" title="Верифікований артист">
                            <i className="bi bi-patch-check-fill" />
                        </span>
                    )}
                </div>

                {/* Текстова інфо */}
                <div className="artist-dashboard-header__info">
                    <p className="artist-dashboard-header__label">Профіль артиста</p>
                    <h1 className="artist-dashboard-header__name">{profile?.name ?? '—'}</h1>

                    <div className="artist-dashboard-header__stats">
                        {statItems.map((stat, i, arr) => (
                            <React.Fragment key={stat.label}>
                                <div className="artist-dashboard-header__stat">
                                    <span className="artist-dashboard-header__stat-value">{stat.value}</span>
                                    <span className="artist-dashboard-header__stat-label">{stat.label}</span>
                                </div>
                                {i < arr.length - 1 && (
                                    <div className="artist-dashboard-header__stat-divider" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {bio && (
                        <div className="artist-dashboard-header__bio">
                            <p className={`artist-dashboard-header__bio-text${bioExpanded ? ' artist-dashboard-header__bio-text--expanded' : ''}`}>
                                {bio}
                            </p>
                            <button
                                className="artist-dashboard-header__bio-toggle"
                                onClick={() => setBioExpanded(v => !v)}
                            >
                                {bioExpanded ? 'Згорнути' : 'Детальніше'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Іконки-кнопки */}
            <div className="artist-dashboard-header__actions">
                <Link
                    href="/artist-dashboard/settings"
                    className="artist-dashboard-header__action-btn"
                    title="Редагувати профіль"
                >
                    <i className="bi bi-pencil" />
                </Link>
                {profile?.id && (
                    <a
                        href={`/artists/${profile.id}`}
                        className="artist-dashboard-header__action-btn"
                        title="Публічна сторінка"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <i className="bi bi-box-arrow-up-right" />
                    </a>
                )}
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════
export const ArtistDashboardPage = () => {
    const artistId = useCurrentArtistId();
    const enabled = !!artistId;

    const statsParams = { artistId: artistId ?? undefined };
    const tracksParams = { ArtistId: artistId ?? undefined, Page: 1, PageSize: 10 };
    const albumsParams = { ArtistId: artistId ?? undefined, Page: 1, PageSize: 10 };

    const { data: profileRaw, isLoading: isProfileLoading } = useGetApiStudioArtistProfileArtistId(
        artistId ?? '',
        { query: { enabled, queryKey: getGetApiStudioArtistProfileArtistIdQueryKey(artistId ?? '') } },
    );
    const { data: statsRaw } = useGetApiStudioArtistStats(statsParams, {
        query: { enabled, queryKey: getGetApiStudioArtistStatsQueryKey(statsParams) },
    });
    const { data: tracksRaw } = useGetApiStudioArtistTracks(tracksParams, {
        query: { enabled, queryKey: getGetApiStudioArtistTracksQueryKey(tracksParams) },
    });
    const { data: albumsRaw } = useGetApiStudioArtistAlbums(albumsParams, {
        query: { enabled, queryKey: getGetApiStudioArtistAlbumsQueryKey(albumsParams) },
    });

    const profile = unwrap<StudioArtistProfileDto>(profileRaw);
    const stats = unwrap<ArtistAnalyticsDto>(statsRaw);
    const artistName = profile?.name ?? '';

    const tracks: TrackCardData[] = unwrapItems<StudioTrackListItemFlex>(tracksRaw).map(t => ({
        id: t.id ?? '',
        title: t.title ?? 'Без назви',
        artistNames: t.artistNames ?? (artistName ? [artistName] : []),
        coverUrl: t.coverUrl,
    }));

    const albums: AlbumCardData[] = unwrapItems<StudioAlbumListItemFlex>(albumsRaw).map(a => ({
        id: a.id ?? '',
        title: a.title ?? 'Без назви',
        artistName,
        tracksCount: a.tracksCount,
        coverUrl: a.coverUrl,
    }));

    const tracksRef = useRef<HTMLDivElement>(null);
    const albumsRef = useRef<HTMLDivElement>(null);

    const scroll = (ref: React.RefObject<HTMLDivElement | null>, dir: 'prev' | 'next') => {
        if (!ref.current) return;
        const amount = ref.current.offsetWidth * 0.8;
        ref.current.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
    };

    // Стан «ще не артист» тепер обробляє ArtistDashboardLayout (чистий екран без
    // студійного хрому), тож сюди ми потрапляємо лише з валідним artistId.

    return (
        <div className="artist-dashboard">
            <ArtistDashboardHeader profile={profile} stats={stats} />

            <div className="artist-dashboard__content">
                {/* ─── Мої треки ────────────────────── */}
                <section className="mb-5">
                    <SectionHeader
                        title="Ваші треки"
                        showAll
                        showAllHref="/artist-dashboard/tracks"
                        onPrev={() => scroll(tracksRef, 'prev')}
                        onNext={() => scroll(tracksRef, 'next')}
                    />
                    {tracks.length === 0 ? (
                        <p className="artist-dashboard__empty">
                            {isProfileLoading ? 'Завантаження…' : 'Треків ще немає.'}
                        </p>
                    ) : (
                        <div className="section-slider-wrap">
                            <div ref={tracksRef} className="row g-3 flex-nowrap overflow-x-auto artist-slider">
                                {tracks.map((track) => (
                                    <div key={track.id} className="col-6 col-md-4 col-lg-2">
                                        <TrackCard track={track} />
                                    </div>
                                ))}
                                <div className="col-auto" style={{ minWidth: 80 }} />
                            </div>
                            <div className="section-slider-wrap__show-all">
                                <ShowAllButton href="/artist-dashboard/tracks" />
                            </div>
                        </div>
                    )}
                </section>

                {/* ─── Мої альбоми ──────────────────── */}
                <section className="mb-5">
                    <SectionHeader
                        title="Ваші створені альбоми"
                        showAll
                        showAllHref="/artist-dashboard/albums"
                        onPrev={() => scroll(albumsRef, 'prev')}
                        onNext={() => scroll(albumsRef, 'next')}
                    />
                    {albums.length === 0 ? (
                        <p className="artist-dashboard__empty">
                            {isProfileLoading ? 'Завантаження…' : 'Альбомів ще немає.'}
                        </p>
                    ) : (
                        <div className="section-slider-wrap">
                            <div ref={albumsRef} className="row g-3 flex-nowrap overflow-x-auto artist-slider">
                                {albums.map((album) => (
                                    <div key={album.id} className="col-6 col-md-4 col-lg-2">
                                        <AlbumCard album={album} />
                                    </div>
                                ))}
                                <div className="col-auto" style={{ minWidth: 80 }} />
                            </div>
                            <div className="section-slider-wrap__show-all">
                                <ShowAllButton href="/artist-dashboard/albums" />
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};
