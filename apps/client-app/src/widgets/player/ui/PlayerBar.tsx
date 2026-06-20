'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePlayerStore } from '@/entities/player/model/playerStore';
import { usePlayer } from '@/entities/player/lib/usePlayer';
import { getImageUrl } from '@/shared/lib/getImageUrl';

import { useFavoriteTrack } from '@/features/track/lib/useFavoriteTrack';
import { AddToPlaylistModal } from '@/features/playlist/add/ui/AddToPlaylistModal';
import { useGetApiMePlaylists, useGetApiMeFavoritesTracks } from '@repo/api/client.ts';

const CDN_BASE = 'https://dev-i.yuviron.com';

const formatTime = (sec: number): string => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

// ─── SUB-COMPONENTS ──────────────────────────────────────
interface TrackInfoProps {
    title:      string;
    artistName: string;
    artistId?:  string;
    coverSrc:   string;
    isLoading:  boolean;
    isAdMode:   boolean;
    onAdClick?: () => void;
    isLiked:    boolean;
    isLikePending: boolean;
    onLikeClick: (e: React.MouseEvent) => void;
    onPlaylistClick: (e: React.MouseEvent) => void;
    setIsInPlaylist: boolean;
}

const TrackInfo = ({
                       title, artistName, artistId, coverSrc, isLoading, isAdMode, onAdClick,
                       isLiked, isLikePending, onLikeClick, onPlaylistClick, setIsInPlaylist
                   }: TrackInfoProps) => (
    <div className="player-bar__track">
        <div
            className="player-bar__cover"
            onClick={isAdMode ? onAdClick : undefined}
            style={{ cursor: isAdMode ? 'pointer' : 'default' }}
        >
            <img src={coverSrc} alt={title} draggable={false} />
            {isLoading && (
                <div className="player-bar__cover-loader">
                    <span className="spinner-border spinner-border-sm" />
                </div>
            )}
        </div>
        <div className="player-bar__meta">
            <span className="player-bar__title">{title}</span>
            {artistId && !isAdMode ? (
                <Link href={`/artists/${artistId}`} className="player-bar__artist">
                    {artistName}
                </Link>
            ) : (
                <span className="player-bar__artist">{artistName}</span>
            )}
        </div>

        {/* ─── КНОПКИ ШВИДКИХ ДІЙ (ПЛЮС ТА ЛАЙК) ────────────────────── */}
        {!isAdMode && title && (
            <div className="player-bar__actions d-flex align-items-center gap-2">
                {/* Додати в плейліст */}
                <button
                    className={`player-bar__action-btn player-bar__action-btn--plus${setIsInPlaylist ? ' player-bar__action-btn--active text-primary' : ''}`}
                    onClick={onPlaylistClick}
                    title="Додати до плейліста"
                    aria-label="Додати до плейліста"
                >
                    <i className={`bi ${setIsInPlaylist ? 'bi-check-circle-fill' : 'bi bi-plus-circle'}`} />
                </button>

                {/* Улюблене серце */}
                <button
                    className={`player-bar__action-btn player-bar__action-btn--heart${isLiked ? ' player-bar__action-btn--active' : ''}`}
                    onClick={onLikeClick}
                    disabled={isLikePending}
                    title={isLiked ? "Прибрати з улюблених" : "Додати до улюблених"}
                    aria-label={isLiked ? "Прибрати з улюблених" : "Додати до улюблених"}
                >
                    <i className={`bi ${isLiked ? 'bi-suit-heart-fill' : 'bi bi-suit-heart'}`} />
                </button>
            </div>
        )}
    </div>
);

interface PlaybackControlsProps {
    isPlaying:  boolean;
    isLoading:  boolean;
    isAdMode:   boolean;
    hasPrev:    boolean;
    hasNext:    boolean;
    currentTime: number;
    duration:   number;
    onTogglePlay: () => void;
    onNext:     () => void;
    onPrev:     () => void;
    onSeek:     (time: number) => void;
}

const PlaybackControls = ({
                              isPlaying, isLoading, isAdMode,
                              hasPrev, hasNext,
                              currentTime, duration,
                              onTogglePlay, onNext, onPrev, onSeek,
                          }: PlaybackControlsProps) => {

    const progressPercent = useMemo(() => {
        if (!duration) return 0;
        return (currentTime / duration) * 100;
    }, [currentTime, duration]);

    return (
        <div className="player-bar__controls">
            <div className="player-bar__buttons">
                <button
                    className="player-bar__btn"
                    onClick={onPrev}
                    disabled={!!isAdMode || !hasPrev}
                    aria-label="Попередній трек"
                >
                    <i className="bi bi-skip-start-fill" />
                </button>

                <button
                    className="player-bar__btn player-bar__btn--play"
                    onClick={onTogglePlay}
                    disabled={isLoading || !!isAdMode}
                    aria-label={isPlaying ? 'Пауза' : 'Грати'}
                >
                    {isLoading
                        ? <span className="spinner-border spinner-border-sm" />
                        : <i className={`bi bi-${isPlaying ? 'pause' : 'play'}-fill`} />
                    }
                </button>

                <button
                    className="player-bar__btn"
                    onClick={onNext}
                    disabled={!!isAdMode || !hasNext}
                    aria-label="Наступний track"
                >
                    <i className="bi bi-skip-end-fill" />
                </button>
            </div>

            <div className="player-bar__progress">
                <span className="player-bar__time">{formatTime(currentTime)}</span>
                <input
                    type="range"
                    className="player-bar__seek"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={e => onSeek(Number(e.target.value))}
                    disabled={!!isAdMode}
                    style={{ '--progress': `${progressPercent}%` } as React.CSSProperties}
                />
                <span className="player-bar__time">{formatTime(duration)}</span>
            </div>
        </div>
    );
};

interface VolumeControlProps {
    volume:    number;
    isMuted:   boolean;
    onToggleMute: () => void;
    onSetVolume:  (vol: number) => void;
}

const VolumeControl = ({ volume, isMuted, onToggleMute, onSetVolume }: VolumeControlProps) => {
    const iconSuffix = isMuted || volume === 0 ? 'mute' : volume < 0.5 ? 'down' : 'up';
    const volumePercent = isMuted ? 0 : volume * 100;

    return (
        <div className="player-bar__volume">
            <button
                className="player-bar__btn player-bar__btn--sm"
                onClick={onToggleMute}
                aria-label={isMuted ? 'Увімкнути звук' : 'Вимкнути звук'}
            >
                <i className={`bi bi-volume-${iconSuffix}-fill`} />
            </button>
            <input
                type="range"
                className="player-bar__volume-slider"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={e => onSetVolume(Number(e.target.value))}
                style={{ '--volume-progress': `${volumePercent}%` } as React.CSSProperties}
            />
        </div>
    );
};

interface PlayerBarProps {
    onToast?: (msg: string) => void;
}

// ─── MAIN COMPONENT ──────────────────────────────────────
export const PlayerBar = ({ onToast }: PlayerBarProps) => {
    const {
        currentTrack, status, pendingAd,
        currentTime, duration, volume, isMuted,
        queue, queueIndex,
        toggleMute,
    } = usePlayerStore();

    // 🌟 ФІКС: Передаємо trackId обома регістрами для 100% сумісності з DTO бекенду,
    // а також явно форсуємо оновлення ключа ТанСтак запиту при зміні активного треку!
    const { data: myPlaylistsRaw } = useGetApiMePlaylists(
        {
            PageSize: 50,
            TrackId: currentTrack?.id,
            trackId: currentTrack?.id
        } as any,
        {
            query: {
                queryKey: ['getApiMePlaylists', currentTrack?.id],
                enabled: !!currentTrack?.id
            }
        } as any
    );

    const { data: favoritesRaw } = useGetApiMeFavoritesTracks();

    const { togglePlay, next, prev, seek, setVolume } = usePlayer();
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

    const isAdMode  = status === 'ad' && !!pendingAd;
    const isPlaying = status === 'playing';
    const isLoading = status === 'loading';
    const hasPrev   = queueIndex > 0;
    const hasNext   = queueIndex < queue.length - 1;

    const { isLiked, isPending: isLikePending, toggle: toggleLike } = useFavoriteTrack({
        initialLiked: (currentTrack as any)?.isSaved ?? false,
    });

    // Розрахунок стану додавання поточного треку до плейлістів
    const isInPlaylist = useMemo(() => {
        // Дістаємо чистий список об'єктів з респонсу
        const rawItems = (myPlaylistsRaw as any)?.data?.items ?? (myPlaylistsRaw as any)?.items ?? [];
        if (!Array.isArray(rawItems)) return false;

        // 🌟 Дивимось строго на поле containsTrack, яке тепер бек повертає правильно
        return rawItems.some((playlist: any) => playlist?.containsTrack === true);
    }, [myPlaylistsRaw]);

    const coverSrc = useMemo(() => {
        if (isAdMode && pendingAd) return `${CDN_BASE}/${pendingAd.imageUrl}`;
        return getImageUrl(currentTrack?.coverUrl) ?? `/images/track-placeholder.png`;
    }, [isAdMode, pendingAd, currentTrack]);

    const trackTitle = isAdMode && pendingAd
        ? `${pendingAd.advertiserName} — ${pendingAd.title}`
        : (currentTrack?.title ?? '');

    const artistName = isAdMode ? 'Реклама' : (currentTrack?.artistNames.join(', ') ?? '');
    const isVisible = !!currentTrack || status !== 'idle';

    if (!isVisible) return null;

    const handleAdClick = () => {
        if (isAdMode && pendingAd?.clickUrl) {
            window.open(pendingAd.clickUrl, '_blank', 'noopener,noreferrer');
            fetch(`/api/ads/${pendingAd.adId}/clicks`, { method: 'POST' }).catch(() => {});
        }
    };

    const handleLikeToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentTrack?.id) {
            toggleLike(currentTrack.id);
        }
    };

    const handleAddToPlaylistSuccess = (playlistTitle: string) => {
        setIsPlaylistModalOpen(false);
        onToast?.(`Трек успішно збережено в плейліст "${playlistTitle}".`);
    };

    return (
        <div className="player-bar">
            <TrackInfo
                title={trackTitle}
                artistName={artistName}
                artistId={currentTrack?.artistId}
                coverSrc={coverSrc}
                isLoading={isLoading}
                isAdMode={isAdMode}
                onAdClick={handleAdClick}
                isLiked={isLiked}
                isLikePending={isLikePending}
                onLikeClick={handleLikeToggle}
                onPlaylistClick={() => setIsPlaylistModalOpen(true)}
                setIsInPlaylist={isInPlaylist}
            />

            <PlaybackControls
                isPlaying={isPlaying}
                isLoading={isLoading}
                isAdMode={isAdMode}
                hasPrev={hasPrev}
                hasNext={hasNext}
                currentTime={currentTime}
                duration={duration}
                onTogglePlay={togglePlay}
                onNext={next}
                onPrev={prev}
                onSeek={seek}
            />

            <VolumeControl
                volume={volume}
                isMuted={isMuted}
                onToggleMute={toggleMute}
                onSetVolume={setVolume}
            />

            {isPlaylistModalOpen && currentTrack && (
                <AddToPlaylistModal
                    isOpen={isPlaylistModalOpen}
                    onClose={() => setIsPlaylistModalOpen(false)}
                    trackId={currentTrack.id}
                    trackTitle={currentTrack.title}
                    onCreatePlaylist={() => setIsPlaylistModalOpen(false)}
                    onSuccess={(playlistTitle: string) => handleAddToPlaylistSuccess(playlistTitle)}
                />
            )}
        </div>
    );
};