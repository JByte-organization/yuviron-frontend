'use client';

import React from 'react';
import { CollectionActions } from '@/shared/ui/Playlist/CollectionActions/CollectionActions';

interface AlbumHeaderProps {
    title: string;
    coverUrl: string;
    artistsNames: string;
    releaseYear: number | null;
    tracksCount: number;
    dominantColor: string;
    // Пропсы для управления плеером, которые придут из AlbumPage
    isCollectionPlaying: boolean;
    onPlayAll: () => void;
    onShufflePlay: () => void;
}

export const AlbumHeader = ({
                                title,
                                coverUrl,
                                artistsNames,
                                releaseYear,
                                tracksCount,
                                dominantColor,
                                isCollectionPlaying,
                                onPlayAll,
                                onShufflePlay,
                            }: AlbumHeaderProps) => {
    return (
        <div>
            <div className="album-header p-4 px-md-5 d-flex flex-column gap-4" style={{ backgroundColor: dominantColor }}>
                <div className="d-flex flex-column flex-md-row gap-4 align-items-md-end">
                    <div className="album-header__cover shadow-lg">
                        <img src={coverUrl} alt={title} style={{ width: 232, height: 232, objectFit: 'cover', borderRadius: 8 }} />
                    </div>

                    <div className="album-header__info text-white">
                        <p className="text-uppercase small fw-bold tracking-wider text-white-50 mb-1">Альбом</p>
                        <h1 className="display-4 fw-black mb-2">{title}</h1>
                        <div className="album-header__meta d-flex align-items-center gap-2 small text-white-50">
                            <span className="fw-bold text-white">{artistsNames}</span>
                            {releaseYear && <span>• {releaseYear}</span>}
                            <span>• {tracksCount} треків</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-md-5 mt-3 mb-4">
                <CollectionActions
                    isCollectionPlaying={isCollectionPlaying}
                    onPlayAll={onPlayAll}
                    onShufflePlay={onShufflePlay}
                    className="mt-2"
                />
            </div>
        </div>
    );
};