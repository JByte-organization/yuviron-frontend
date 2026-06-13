'use client';

import React from 'react';
import type { PopularAlbumDto } from '@repo/api/admin.ts';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import { formatNumber } from '@/shared/lib/formatNumber';

interface Props {
    albums: PopularAlbumDto[];
}

export const PopularAlbums = ({ albums }: Props) => {
    return (
        <div className="trending-albums">
            {/* Заголовок секції */}
            <h6 className="text-white fw-bold mb-4 d-flex align-items-center gap-2">
                <i className="bi bi-disc-fill trending-albums__icon" />
                Trending Albums & Releases
            </h6>

            {albums.length === 0 ? (
                <div className="text-secondary py-4 small d-flex align-items-center gap-2">
                    <i className="bi bi-music-note-list fs-5" />
                    No trending albums data available for this period.
                </div>
            ) : (
                <div className="d-flex flex-wrap gap-4">
                    {albums.map((album, index) => {
                        const coverSrc = getImageUrl(album.coverUrl);

                        return (
                            <div
                                key={album.id ?? index}
                                className="trending-albums__item d-flex flex-column"
                            >
                                {/* Контейнер обкладинки з динамічним модифікатором стану */}
                                <div
                                    className={`rounded-3 overflow-hidden mb-2.5 position-relative flex-shrink-0 trending-albums__cover ${
                                        !coverSrc ? 'trending-albums__cover--empty' : ''
                                    }`}
                                >
                                    {coverSrc ? (
                                        <img
                                            src={coverSrc}
                                            alt={album.title ?? 'Album Cover'}
                                            className="w-100 h-100 object-fit-cover trending-albums__image"
                                        />
                                    ) : (
                                        <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                                            <span>💿</span>
                                        </div>
                                    )}
                                </div>

                                {/* Назва альбому */}
                                <div
                                    className="text-white small fw-semibold text-truncate trending-albums__item-title"
                                    title={album.title ?? ''}
                                >
                                    {album.title || '—'}
                                </div>

                                {/* Кількість стримів */}
                                <div className="trending-albums__item-plays font-monospace">
                                    <span className="trending-albums__item-count">
                                        {formatNumber(album.totalPlays)}
                                    </span> plays
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};