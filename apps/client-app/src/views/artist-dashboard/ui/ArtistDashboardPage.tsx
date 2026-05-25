'use client';

import React, { useRef, useState } from 'react';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { TrackCard, type TrackCardData } from '@/entities/track/ui/TrackCard';
import { AlbumCard, type AlbumCardData } from '@/entities/album/ui/AlbumCard';
import { ArtistCard, type ArtistCardData } from '@/entities/artist/ui/ArtistCard';
import { ShowAllButton } from '@/shared/ui/ShowAllButton';
import { useAvatarColor } from '@/shared/lib/useAvatarColor';

// ══════════════════════════════════════════════════════════
// MOCK DATA
// TODO: замінити на реальні хуки після бекенду
// ══════════════════════════════════════════════════════════
const MOCK_ARTIST = {
    id:                 'artist-1',
    stageName:          'МузикаВітч',
    bio:                'Вітаю всіх! Дякую, що завітали на мою сторінку. Тут ви знайдете мою музику, емоції та натхнення. Слухайте, відчувайте та діліться враженнями 🎵',
    avatarUrl:          'https://picsum.photos/id/91/200/200',
    bannerUrl:          null as string | null,
    monthlyListeners:   666,
    totalTracks:        5,
    totalAlbums:        3,
    followersCount:     56,
    verificationStatus: 'Verified' as const,
};

const MOCK_TRACKS: TrackCardData[] = [
    { id: 't1', title: 'THE CONTORTIONIST', artistNames: ['МузикаВітч'],                    coverUrl: null },
    { id: 't2', title: 'Глубоко',           artistNames: ['МузикаВітч', 'Надя Дорофєєва'], coverUrl: null },
    { id: 't3', title: 'Superman',          artistNames: ['МузикаВітч'],                    coverUrl: null },
    { id: 't4', title: 'Sweater Weather',   artistNames: ['МузикаВітч'],                    coverUrl: null },
    { id: 't5', title: 'Cry Me A River',    artistNames: ['МузикаВітч'],                    coverUrl: null },
];

const MOCK_ALBUMS: AlbumCardData[] = [
    { id: 'a1', title: 'ДЛЯ НАСТРОЮ1',    artistName: 'МузикаВітч', tracksCount: 8,  coverUrl: null },
    { id: 'a2', title: 'ДЛЯ НАСТРОЮ2',    artistName: 'МузикаВітч', tracksCount: 10, coverUrl: null },
    { id: 'a3', title: 'ПІДТРИМКА КО...', artistName: 'МузикаВітч', tracksCount: 5,  coverUrl: null },
];

const MOCK_FOLLOWING: ArtistCardData[] = [
    { id: 'f1', name: 'Lana Del Rey',   monthlyListeners: 4_690_563, avatarUrl: 'https://picsum.photos/seed/lana/120/120'   },
    { id: 'f2', name: 'Lady Gaga',      monthlyListeners: 4_690_563, avatarUrl: 'https://picsum.photos/seed/gaga/120/120'   },
    { id: 'f3', name: 'Shakira',        monthlyListeners: 4_690_563, avatarUrl: 'https://picsum.photos/seed/shakira/120/120' },
    { id: 'f4', name: 'Jennifer Lopez', monthlyListeners: 4_690_563, avatarUrl: 'https://picsum.photos/seed/jlo/120/120'    },
];

// ══════════════════════════════════════════════════════════
// HEADER
// ══════════════════════════════════════════════════════════
const ArtistDashboardHeader = () => {
    const [bioExpanded, setBioExpanded] = useState(false);
    const dominantColor = useAvatarColor(
        MOCK_ARTIST.bannerUrl ? null : MOCK_ARTIST.avatarUrl
    );

    const formatCount = (n: number) => {
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' млн';
        if (n >= 1_000)     return (n / 1_000).toFixed(1) + ' тис';
        return String(n);
    };

    return (
        <div className="artist-dashboard-header">

            {/* Банер або градієнт */}
            <div
                className="artist-dashboard-header__banner"
                style={MOCK_ARTIST.bannerUrl
                    ? { backgroundImage: `url(${MOCK_ARTIST.bannerUrl})` }
                    : { background: `linear-gradient(135deg, ${dominantColor} 0%, transparent 100%)` }
                }
            />

            {/* Темний оверлей знизу */}
            <div className="artist-dashboard-header__overlay" />

            {/* Основний контент */}
            <div className="artist-dashboard-header__content">

                {/* Аватарка */}
                <div className="artist-dashboard-header__avatar-wrap">
                    <img
                        src={MOCK_ARTIST.avatarUrl}
                        alt={MOCK_ARTIST.stageName}
                        className="artist-dashboard-header__avatar"
                    />
                    {MOCK_ARTIST.verificationStatus === 'Verified' && (
                        <span
                            className="artist-dashboard-header__verified"
                            title="Верифікований артист"
                        >
                            <i className="bi bi-patch-check-fill" />
                        </span>
                    )}
                </div>

                {/* Текстова інфо */}
                <div className="artist-dashboard-header__info">
                    <p className="artist-dashboard-header__label">Профіль артиста</p>
                    <h1 className="artist-dashboard-header__name">
                        {MOCK_ARTIST.stageName}
                    </h1>

                    {/* Статистика */}
                    <div className="artist-dashboard-header__stats">
                        {[
                            { value: MOCK_ARTIST.totalTracks,                    label: 'Треки' },
                            { value: MOCK_ARTIST.totalAlbums,                    label: 'Альбоми' },
                            { value: formatCount(MOCK_ARTIST.monthlyListeners),   label: 'Слухачів' },
                            { value: formatCount(MOCK_ARTIST.followersCount),     label: 'Підписники' },
                        ].map((stat, i, arr) => (
                            <React.Fragment key={stat.label}>
                                <div className="artist-dashboard-header__stat">
                                    <span className="artist-dashboard-header__stat-value">
                                        {stat.value}
                                    </span>
                                    <span className="artist-dashboard-header__stat-label">
                                        {stat.label}
                                    </span>
                                </div>
                                {i < arr.length - 1 && (
                                    <div className="artist-dashboard-header__stat-divider" />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Біо */}
                    {MOCK_ARTIST.bio && (
                        <div className="artist-dashboard-header__bio">
                            <p className={`artist-dashboard-header__bio-text${bioExpanded ? ' artist-dashboard-header__bio-text--expanded' : ''}`}>
                                {MOCK_ARTIST.bio}
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
                <button
                    className="artist-dashboard-header__action-btn"
                    title="Редагувати профіль"
                    onClick={() => console.log('edit profile')} // TODO: EditArtistProfileModal
                >
                    <i className="bi bi-pencil" />
                </button>
                <a
                    href={`/artists/${MOCK_ARTIST.id}`}
                    className="artist-dashboard-header__action-btn"
                    title="Публічна сторінка"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i className="bi bi-box-arrow-up-right" />
                </a>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════
// PAGE
// ══════════════════════════════════════════════════════════
export const ArtistDashboardPage = () => {
    const tracksRef = useRef<HTMLDivElement>(null);
    const albumsRef = useRef<HTMLDivElement>(null);
    const followRef = useRef<HTMLDivElement>(null);

    const scroll = (ref: React.RefObject<HTMLDivElement | null>, dir: 'prev' | 'next') => {
        if (!ref.current) return;
        const amount = ref.current.offsetWidth * 0.8;
        ref.current.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
    };

    return (
        <div className="artist-dashboard">

            <ArtistDashboardHeader />

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
                    <div className="section-slider-wrap">
                        <div
                            ref={tracksRef}
                            className="row g-3 flex-nowrap overflow-x-auto artist-slider"
                        >
                            {MOCK_TRACKS.map((track) => (
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
                    <div className="section-slider-wrap">
                        <div
                            ref={albumsRef}
                            className="row g-3 flex-nowrap overflow-x-auto artist-slider"
                        >
                            {MOCK_ALBUMS.map((album) => (
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
                </section>

                {/* ─── Ви слідкуєте ─────────────────── */}
                {MOCK_FOLLOWING.length > 0 && (
                    <section className="mb-5">
                        <SectionHeader
                            title="Ви слідкуєте"
                            onPrev={() => scroll(followRef, 'prev')}
                            onNext={() => scroll(followRef, 'next')}
                        />
                        <div
                            ref={followRef}
                            className="row g-3 flex-nowrap overflow-x-auto artist-slider"
                        >
                            {MOCK_FOLLOWING.map((artist) => (
                                <div key={artist.id} className="col-auto">
                                    <ArtistCard artist={artist} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
};