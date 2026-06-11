'use client';

import React from 'react';
import { getImageUrl } from '@/shared/lib/getImageUrl';

interface ArtistAboutSectionProps {
    artistId: string;
    monthlyListeners?: number;
    bio?: string | null;
    bannerUrl?: string | null;
}

const formatListeners = (count?: number): string => {
    if (!count) return '';
    return count.toLocaleString('uk-UA') + ' слухачів за місяць';
};

export const ArtistAboutSection = ({
                                       artistId,
                                       monthlyListeners,
                                       bio,
                                       bannerUrl,
                                   }: ArtistAboutSectionProps) => {

    // 🚨 ФИКС: Переводим на единый хелпер обработки изображений
    const bannerSrc = getImageUrl(bannerUrl)
        ?? `https://picsum.photos/seed/banner-${artistId}/1200/500`; // Немного увеличили разрешение для баннера

    // Если нет ни описания, ни слушателей, ни баннера — скрываем пустую секцию
    if (!monthlyListeners && !bio && !bannerUrl) return null;

    return (
        <section className="artist-about mb-5">
            <h2 className="section-header__title mb-3">Про виконавця</h2>

            <div className="artist-about__card">
                {/* Банер */}
                <div className="artist-about__banner">
                    <img src={bannerSrc} alt="About artist banner" />

                    {/* Overlay з інфо */}
                    <div className="artist-about__overlay">
                        {monthlyListeners && (
                            <p className="artist-about__listeners">
                                {formatListeners(monthlyListeners)}
                            </p>
                        )}
                        {bio && (
                            <p className="artist-about__bio">{bio}</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};