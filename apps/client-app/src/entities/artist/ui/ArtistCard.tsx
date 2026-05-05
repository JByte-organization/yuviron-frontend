import React from 'react';

export interface ArtistCardData {
    id: string;
    name: string;
    monthlyListeners?: number;
    avatarUrl?: string | null;
}

interface ArtistCardProps {
    artist: ArtistCardData;
    onClick?: (id: string) => void;
}

const formatListeners = (count?: number): string => {
    if (!count) return '';
    return count.toLocaleString('uk-UA');
};

export const ArtistCard = ({ artist, onClick }: ArtistCardProps) => {
    const avatarSrc = artist.avatarUrl
        ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${artist.avatarUrl}`
        : 'https://picsum.photos/seed/artist-' + artist.id + '/200/200';

    return (
        <div className="artist-card" onClick={() => onClick?.(artist.id)}>
            <div className="artist-card__avatar">
                <img src={avatarSrc} alt={artist.name} />
            </div>
            <p className="artist-card__name">{artist.name}</p>
            {artist.monthlyListeners !== undefined && (
                <p className="artist-card__listeners">{formatListeners(artist.monthlyListeners)}</p>
            )}
        </div>
    );
};