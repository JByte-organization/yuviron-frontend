'use client';

import React from 'react';

interface AlbumHeaderProps {
    title: string;
    coverUrl: string;
    artistsNames: string;
    releaseYear: number | null;
    tracksCount: number;
    dominantColor: string;
}

export const AlbumHeader = ({
                                title,
                                coverUrl,
                                artistsNames,
                                releaseYear,
                                tracksCount,
                                dominantColor,
                            }: AlbumHeaderProps) => {
    return (
        <div
            className="album-page__hero d-flex align-items-end p-4 p-md-5 gap-4"
            style={{
                background: `linear-gradient(180deg, ${dominantColor} 0%, #121212 100%)`,
            }}
        >
            {/* Обкладинка */}
            <div className="album-page__cover-wrap shadow-lg flex-shrink-0">
                <img
                    src={coverUrl}
                    alt={`${title} cover`}
                    className="album-page__cover img-fluid"
                    style={{ width: 232, height: 232, objectFit: 'cover' }}
                />
            </div>

            {/* Метадані */}
            <div className="album-page__meta text-white">
                <p className="text-uppercase small fw-bold mb-1 tracking-wider m-0">
                    Альбом
                </p>
                <h1
                    className="display-4 fw-black mb-3 m-0 text-break"
                    style={{ fontWeight: 900, lineHeight: 1.1 }}
                >
                    {title}
                </h1>
                <div className="d-flex align-items-center gap-1 flex-wrap small fw-bold">
                    <span className="album-page__artist-link text-white">
                        {artistsNames}
                    </span>
                    {releaseYear && (
                        <>
                            <span className="text-secondary">•</span>
                            <span className="text-secondary">{releaseYear}</span>
                        </>
                    )}
                    {tracksCount > 0 && (
                        <>
                            <span className="text-secondary">•</span>
                            <span>{tracksCount} треків</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};