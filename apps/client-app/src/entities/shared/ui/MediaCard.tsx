import React from 'react';
import { getImageUrl } from '@/shared/lib/getImageUrl';

interface MediaCardProps {
    title: string;
    subtitle?: string;
    coverUrl?: string | null;
    coverSeed?: string;
    onClick?: () => void;
}

/**
 * Базовий компонент картки — обкладинка + назва + підпис.
 * Використовується в AlbumCard, PlaylistCard і будь-яких інших картках.
 * Розмір контролюється Bootstrap колонками в батьківському компоненті.
 */
export const MediaCard = ({
                              title,
                              subtitle,
                              coverUrl,
                              coverSeed = 'media',
                              onClick,
                          }: MediaCardProps) => {

    const src = getImageUrl(coverUrl)
        ?? `https://picsum.photos/seed/track-${coverSeed}/300/300`;



    return (
        <div className="media-card" onClick={onClick}>
            <div className="media-card__cover">
                <img src={src} alt={title} />
            </div>
            <div className="media-card__info">
                <p className="media-card__title">{title}</p>
                {subtitle && (
                    <p className="media-card__subtitle">{subtitle}</p>
                )}
            </div>
        </div>
    );
};