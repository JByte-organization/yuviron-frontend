'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePlayerStore } from '@/entities/player/model/playerStore';
import { usePlayer } from '@/entities/player/lib/usePlayer';
import { getImageUrl } from '@/shared/lib/getImageUrl';

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
}

const TrackInfo = ({ title, artistName, artistId, coverSrc, isLoading, isAdMode }: TrackInfoProps) => (
    <div className="player-bar__track">
        <div className="player-bar__cover">
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

    // Розраховуємо відсоток прогресу для CSS-градієнта
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
                    aria-label="Наступний трек"
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
                    // Передаємо динамічний відсоток як CSS-змінну
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

// ─── MAIN COMPONENT ──────────────────────────────────────
export const PlayerBar = () => {
    const {
        currentTrack, status, pendingAd,
        currentTime, duration, volume, isMuted,
        queue, queueIndex,
        toggleMute,
    } = usePlayerStore();

    const { togglePlay, next, prev, seek, setVolume } = usePlayer();

    const isAdMode  = status === 'ad' && !!pendingAd;
    const isPlaying = status === 'playing';
    const isLoading = status === 'loading';
    const hasPrev   = queueIndex > 0;
    const hasNext   = queueIndex < queue.length - 1;

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

    return (
        <div className="player-bar">
            <TrackInfo
                title={trackTitle}
                artistName={artistName}
                artistId={currentTrack?.artistId}
                coverSrc={coverSrc}
                isLoading={isLoading}
                isAdMode={isAdMode}
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
        </div>
    );
};