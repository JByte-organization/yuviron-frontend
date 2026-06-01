'use client';

import React, { useState } from 'react';

export interface BannerItem {
    id: string;
    imageUrl: string;
    title?: string | null;
    href?: string | null;
}

interface HeroBannerSectionProps {
    items?: BannerItem[];
    isLoading?: boolean;
}

export const HeroBannerSection = ({
                                      items,
                                      isLoading = false,
                                  }: HeroBannerSectionProps) => {
    const [activeIndex, setActiveIndex] = useState(0);

    if (isLoading) {
        return <div className="skeleton skeleton--rounded mb-4" style={{ height: 500 }} />;
    }


    if (!items || items.length === 0) return null;

    const current = items[activeIndex] ?? items[0];

    return (
        <section className="hero-banner-section mb-4">
            <div className="hero-banner-section__slide">
                <img
                    key={current.id}
                    src={current.imageUrl}
                    alt={current.title ?? ''}
                />
                <div className="hero-banner-section__gradient" />
            </div>

            {items.length > 1 && (
                <div className="hero-banner-section__dots">
                    {items.map((item, i) => (
                        <button
                            key={item.id}
                            className={`hero-banner-section__dot${i === activeIndex ? ' hero-banner-section__dot--active' : ''}`}
                            onClick={() => setActiveIndex(i)}
                            aria-label={`Slide ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};