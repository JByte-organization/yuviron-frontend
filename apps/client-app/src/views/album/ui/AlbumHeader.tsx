'use client';

import React from 'react';
import { useRouter } from 'next/navigation'; // Імпортуємо маршрутизатор
import { CollectionActions } from '@/shared/ui/Playlist/CollectionActions/CollectionActions';

interface AlbumHeaderProps {
    title: string;
    coverUrl: string;
    artistsNames: string;
    artistId: string;
    releaseYear: number | null;
    tracksCount: number;
    // dominantColor: string;
    isCollectionPlaying: boolean;
    onPlayAll: () => void;
    onShufflePlay: () => void;
    onShare?: () => void;
    onReport?: () => void;
}

export const AlbumHeader = ({
                                title,
                                coverUrl,
                                artistsNames,
                                artistId,
                                releaseYear,
                                tracksCount,
                                // dominantColor,
                                isCollectionPlaying,
                                onPlayAll,
                                onShufflePlay,
                                onShare,
                                onReport,
                            }: AlbumHeaderProps) => {
    const router = useRouter(); // Ініціалізуємо інстанс роутера

    return (
        <div>
            <div className="album-header p-4 px-md-5 d-flex flex-column gap-4">
                <div className="d-flex flex-column flex-md-row gap-4 align-items-md-end">
                    <div className="album-header__cover shadow-lg">
                        <img src={coverUrl} alt={title} style={{ width: 232, height: 232, objectFit: 'cover', borderRadius: 8 }} />
                    </div>

                    <div className="album-header__info text-white">
                        <p className="text-uppercase small fw-bold tracking-wider text-white-50 mb-1">Альбом</p>
                        <h1 className="display-4 fw-black mb-2">{title}</h1>
                        <div className="album-header__meta d-flex align-items-center gap-2 small text-white-50">
                            {/* Робимо ім'я виконавця інтерактивним */}
                            <span
                                className="fw-bold text-white"
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                onClick={() => artistId && router.push(`/artists/${artistId}`)}
                            >
                                {artistsNames}
                            </span>
                            {releaseYear && <span>• {releaseYear}</span>}
                            <span>• {tracksCount} треків</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-md-5 mt-3 mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
                <CollectionActions
                    isCollectionPlaying={isCollectionPlaying}
                    onPlayAll={onPlayAll}
                    onShufflePlay={onShufflePlay}
                    className="mt-2"
                />

                <div className="d-flex align-items-center gap-2 mt-2">
                    <button
                        type="button"
                        className="playlist-page-header__btn playlist-page-header__btn--icon d-flex align-items-center justify-content-center"
                        onClick={onShare}
                        title="Поділитися альбомом"
                        style={{ width: '42px', height: '42px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '50%', color: '#fff' }}
                    >
                        <i className="bi bi-share" />
                    </button>

                    <button
                        type="button"
                        className="playlist-page-header__btn playlist-page-header__btn--icon d-flex align-items-center justify-content-center"
                        onClick={onReport}
                        title="Поскаржитися на альбом"
                        style={{ width: '42px', height: '42px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '50%', color: 'var(--client-danger, #ff5050)' }}
                    >
                        <i className="bi bi-exclamation-triangle" />
                    </button>
                </div>
            </div>
        </div>
    );
};