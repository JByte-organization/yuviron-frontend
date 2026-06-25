'use client';

import React, {useMemo} from 'react';
import { getImageUrl } from '@/shared/lib/getImageUrl';

interface MediaCardProps {
    title: string;
    subtitle?: string;
    coverUrl?: string | null;
    coverSeed?: string; // Наприклад: 'playlist-123', 'album-456' або 'media'
    onClick?: () => void;
}

export const MediaCard = ({
                              title,
                              subtitle,
                              coverUrl,
                              coverSeed = 'media',
                              onClick,
                          }: MediaCardProps) => {

    // 🌟 ФІКС: Отримуємо шлях з медіа-сервера
    const fetchedSrc = getImageUrl(coverUrl);

    // 🌟 ФІКС: Якщо зображення немає, дивимось на префікс у coverSeed і ставимо потрібну дефолтну обкладинку
    const src = useMemo(() => {
        if (fetchedSrc) return fetchedSrc;

        if (coverSeed.startsWith('playlist')) {
            return '/images/playlist/placeholder.png';
        }
        if (coverSeed.startsWith('album')) {
            return '/images/album/placeholder.png';
        }

        // Загальний фолбек, якщо тип не визначено
        return '/images/track-placeholder.png';
    }, [fetchedSrc, coverSeed]);

    return (
        <div className="media-card" onClick={onClick}>
            <div className="media-card__cover">
                <img src={src} alt={title} draggable={false} />
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