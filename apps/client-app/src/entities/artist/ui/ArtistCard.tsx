'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { getImageUrl } from '@/shared/lib/getImageUrl';

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

export const ArtistCard = ({ artist, onClick }: ArtistCardProps) => {
    const router = useRouter();

    // Використовуємо твій єдиний хелпер для зображень
    const avatarSrc = (artist.avatarUrl && getImageUrl(artist.avatarUrl)) ?? '/images/artist/placeholder.png';

    const handleClick = () => {
        if (onClick) {
            onClick(artist.id);
        } else {
            router.push(`/artists/${artist.id}`);
        }
    };

    return (
        <div className="artist-card" onClick={handleClick}>
            {/* Контейнер аватарки та абсолютної кнопки Play */}
            <div className="artist-card__avatar-wrapper">
                <div className="artist-card__avatar">
                    <img src={avatarSrc} alt={artist.name} draggable={false} />
                </div>

                {/* Зелена кнопка програвання як на референсі */}
                <button
                    className="artist-card__play-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Тут у майбутньому буде запуск топ-треків артиста
                    }}
                    aria-label={`Грати мікс ${artist.name}`}
                >
                    <i className="bi bi-play-fill" />
                </button>
            </div>

            {/* Метадані під аватаркою */}
            <div className="artist-card__meta">
                <p className="artist-card__name text-truncate">{artist.name}</p>
                <p className="artist-card__role">Виконавець</p>
            </div>
        </div>
    );
};