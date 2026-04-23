'use client';

import React, { useState } from 'react';

export interface BannerItem {
    id: string;
    imageUrl: string;
    title?: string;
    href?: string;
}

interface HeroBannerSectionProps {
    /** TODO: заменить на хук — useGetApiHomeBanners() */
    items?: BannerItem[];
    isLoading?: boolean;
}

const MOCK_ITEMS: BannerItem[] = [
    { id: '1', imageUrl: 'https://picsum.photos/seed/banner1/1200/260', title: 'EXO Planet' },
    { id: '2', imageUrl: 'https://picsum.photos/seed/banner2/1200/260', title: 'Banner 2' },
    { id: '3', imageUrl: 'https://picsum.photos/seed/banner3/1200/260', title: 'Banner 3' },
    { id: '4', imageUrl: 'https://picsum.photos/seed/banner4/1200/260', title: 'Banner 4' },
];

/**
 * Секція: Hero-баннер (слайдер вверху главной страницы).
 *
 * Підключення даних:
 * 1. const { data, isLoading } = useGetApiHomeBanners();
 * 2. <HeroBannerSection items={data?.items} isLoading={isLoading} />
 */
export const HeroBannerSection = ({
                                      items = MOCK_ITEMS,
                                      isLoading = false,
                                  }: HeroBannerSectionProps) => {
    const [activeIndex, setActiveIndex] = useState(0);

    if (isLoading) {
        return <div className="skeleton skeleton--rounded mb-4" style={{ height: 260 }} />;
    }

    const current = items[activeIndex];

    return (
        <section className="hero-banner-section mb-4">
            <div className="hero-banner-section__slide">
                <img key={current.id} src={current.imageUrl} alt={current.title || ''} />
                <div className="hero-banner-section__gradient" />
            </div>

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
        </section>
    );
};