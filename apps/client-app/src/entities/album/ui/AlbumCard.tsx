import React from 'react';

export interface AlbumCardData {
    id: string;
    title: string;
    artistName: string;
    tracksCount?: number;
    coverUrl?: string | null;
}

interface AlbumCardProps {
    album: AlbumCardData;
    onClick?: (id: string) => void;
}

/**
 * Карточка альбому.
 * Розмір контролюється Bootstrap колонками в батьківському компоненті.
 *
 * Підключення даних:
 * coverUrl — ключ з БД, формат: storage_url/coverUrl
 */
export const AlbumCard = ({ album, onClick }: AlbumCardProps) => {
    const coverSrc = album.coverUrl
        ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${album.coverUrl}`
        : `https://picsum.photos/seed/album-${album.id}/300/300`;

    return (
        <div className="album-card" onClick={() => onClick?.(album.id)}>
            <div className="album-card__cover">
                <img src={coverSrc} alt={album.title} />
            </div>
            <div className="album-card__info">
                <p className="album-card__title">{album.title}</p>
                <p className="album-card__artist">by {album.artistName}</p>
                {album.tracksCount !== undefined && (
                    <p className="album-card__tracks">{album.tracksCount} tracks</p>
                )}
            </div>
        </div>
    );
};