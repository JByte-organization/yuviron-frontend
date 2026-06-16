'use client';

import React, { useState, useMemo } from 'react';
import { getImageUrl } from "@/shared/lib/getImageUrl";
import { usePlayer } from '@/entities/player/lib/usePlayer';
import { usePlayerStore } from '@/entities/player/model/playerStore';
import type { TrackRowData } from '@/entities/track/ui/TrackRow';

interface PlaylistInfo {
    id: string;
    name: string;
    coverUrl?: string | null;
    ownerName: string;
    tracksCount: number;
    isSubscribed: boolean;
}

interface PlaylistPageHeaderProps {
    playlist: PlaylistInfo;
    isOwner: boolean;
    tracks: TrackRowData[];
    onEdit?: () => void;
    onDelete?: () => void;
    onShare?: () => void;
    onSubscribe?: () => void;
}

export const PlaylistPageHeader = ({
                                       playlist,
                                       isOwner,
                                       tracks = [],
                                       onEdit,
                                       onDelete,
                                       onShare,
                                       onSubscribe,
                                   }: PlaylistPageHeaderProps) => {
    const [isSubscribed, setIsSubscribed] = useState(playlist.isSubscribed);

    const { playQueue, togglePlay } = usePlayer();
    const currentTrackId = usePlayerStore((s) => s.currentTrack?.id);
    const playerStatus   = usePlayerStore((s) => s.status);

    const isCollectionPlaying = useMemo(() => {
        if (playerStatus !== 'playing' || tracks.length === 0) return false;
        return tracks.some((t) => t.id === currentTrackId);
    }, [tracks, currentTrackId, playerStatus]);

    const handlePlayAll = () => {
        if (tracks.length === 0) return;

        if (isCollectionPlaying) {
            togglePlay();
        } else {
            const queue = tracks.map((t) => ({
                id:          t.id,
                title:       t.title,
                artistNames: t.artistNames,
                coverUrl:    t.coverUrl,
                durationMs:  t.durationMs ?? undefined,
            }));
            playQueue(queue, 0, 'Playlist', playlist.id);
        }
    };

    const coverSrc = getImageUrl(playlist.coverUrl)
        ?? '/images/playlist/placeholder.png';

    const handleSubscribe = () => {
        setIsSubscribed((v) => !v);
        onSubscribe?.();
    };

    return (
        <div className="playlist-page-header">
            <p className="playlist-page-header__breadcrumb">Плейліст</p>

            <div className="row align-items-end g-4 mb-4">
                <div className="col-auto">
                    <div className="playlist-page-header__cover">
                        <img src={coverSrc} alt={playlist.name} />
                    </div>
                </div>

                <div className="col">
                    <h1 className="playlist-page-header__title">{playlist.name}</h1>

                    <p className="playlist-page-header__meta">
                        <span className="playlist-page-header__owner">{playlist.ownerName}</span>
                        <span className="playlist-page-header__dot">•</span>
                        <span>{playlist.tracksCount ?? tracks.length} треків</span>
                    </p>
                </div>
            </div>

            <div className="playlist-page-header__actions">
                <button
                    className={`playlist-page-header__btn playlist-page-header__btn--play${isCollectionPlaying ? ' playlist-page-header__btn--active' : ''}`}
                    onClick={handlePlayAll}
                    aria-label={isCollectionPlaying ? 'Пауза' : 'Відтворити'}
                >
                    <i className={`bi ${isCollectionPlaying ? 'bi-pause-fill' : 'bi bi-play-fill'}`} />
                </button>

                {isOwner ? (
                    <>
                        <button
                            className="playlist-page-header__btn playlist-page-header__btn--icon"
                            onClick={onEdit}
                            aria-label="Редагувати"
                            title="Редагувати плейліст"
                        >
                            <i className="bi bi-pencil" />
                        </button>

                        <button
                            className="playlist-page-header__btn playlist-page-header__btn--icon"
                            onClick={onDelete}
                            aria-label="Видалити"
                            title="Видалити плейліст"
                        >
                            <i className="bi bi-trash" />
                        </button>

                        <button
                            className="playlist-page-header__btn playlist-page-header__btn--icon"
                            onClick={onShare}
                            aria-label="Поділитися"
                            title="Поділитися плейлістом"
                        >
                            <i className="bi bi-share" />
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            className={`playlist-page-header__subscribe-btn${isSubscribed ? ' playlist-page-header__subscribe-btn--active' : ''}`}
                            onClick={handleSubscribe}
                        >
                            {isSubscribed ? 'Відписатися' : 'Підписатися'}
                        </button>

                        <button
                            className="playlist-page-header__btn playlist-page-header__btn--icon"
                            onClick={onShare}
                            aria-label="Поділитися"
                        >
                            <i className="bi bi-share" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};