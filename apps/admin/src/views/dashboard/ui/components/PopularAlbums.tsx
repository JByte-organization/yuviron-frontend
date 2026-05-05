import React from 'react';
import type { PopularAlbumDto } from '@repo/api';

interface Props {
    albums: PopularAlbumDto[];
}

const formatNumber = (n?: number): string => {
    if (!n) return '0';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
};

export const PopularAlbums = ({ albums }: Props) => (
    <div className="rounded-3 p-4" style={{ backgroundColor: '#1e2330' }}>
        <h6 className="text-white fw-semibold mb-3">Trending Albums</h6>

        {albums.length === 0 ? (
            <p className="text-secondary small mb-0">No data</p>
        ) : (
            <div className="d-flex flex-wrap gap-3">
                {albums.map(album => {
                    const coverSrc = album.coverUrl
                        ? `https://api.yuviron.com/storage/${album.coverUrl}`
                        : null;

                    return (
                        <div key={album.id} style={{ width: '90px' }}>
                            <div
                                className="rounded-3 bg-secondary overflow-hidden mb-2"
                                style={{ width: '90px', height: '90px' }}
                            >
                                {coverSrc
                                    ? <img
                                        src={coverSrc}
                                        alt={album.title ?? ''}
                                        className="w-100 h-100 object-fit-cover"
                                    />
                                    : <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                                        <span style={{ fontSize: '1.8rem' }}>💿</span>
                                    </div>
                                }
                            </div>
                            <div className="text-white small fw-semibold text-truncate" title={album.title ?? ''}>
                                {album.title || '—'}
                            </div>
                            <div className="text-secondary" style={{ fontSize: '0.7rem' }}>
                                {formatNumber(album.totalPlays)} plays
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
);