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

    // ─── Отримуємо тільки реальне зображення без фейкових холдерів ─────────
    const bannerSrc = getImageUrl(bannerUrl);

    // Якщо немає взагалі ніякої інформації — повністю ховаємо секцію
    if (!monthlyListeners && !bio && !bannerUrl) return null;

    return (
        <section className="artist-about mb-5 animate-fade-in">
            <h2 className="section-header__title mb-3" style={{ color: 'var(--client-text-strong)' }}>
                Про виконавця
            </h2>

            <div className="artist-about__card overflow-hidden rounded-4">
                {/* 🚨 ФІКС ХОЛДЕРА: Якщо картинки немає, блок заллється фірмовим
                  космічним градієнтом, адаптованим під світлу або темну тему
                */}
                <div
                    className="artist-about__banner"
                    style={
                        !bannerSrc
                            ? { background: 'linear-gradient(180deg, var(--client-surface-2) 0%, var(--client-bg) 100%)' }
                            : undefined
                    }
                >
                    {/* Рендеримо тег img ТІЛЬКИ якщо є справжнє посилання */}
                    {bannerSrc && (
                        <img
                            src={bannerSrc}
                            alt="About artist banner"
                            className="w-100 h-100 object-cover"
                        />
                    )}

                    {/* Матовий текстовий оверлей */}
                    <div className="artist-about__overlay d-flex flex-column justify-content-end p-4 p-md-5">
                        {monthlyListeners && (
                            <p className="artist-about__listeners font-monospace text-uppercase mb-2">
                                {formatListeners(monthlyListeners)}
                            </p>
                        )}
                        {bio && (
                            <p className="artist-about__bio mb-0">
                                {bio}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};