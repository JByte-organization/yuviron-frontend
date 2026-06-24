'use client';

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import type { Swiper as SwiperClass } from 'swiper/types';

import 'swiper/css';

export interface BannerItem {
    id: string;
    imageUrl: string;
    href?: string | null;
}

interface HeroBannerSectionProps {
    items?: BannerItem[];
    isLoading?: boolean;
    onBannerClick?: (item: BannerItem) => void;
}

export const HeroBannerSection = ({
                                      items,
                                      isLoading = false,
                                      onBannerClick,
                                  }: HeroBannerSectionProps) => {
    const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(null);
    const [realIndex, setRealIndex] = useState(0);

    if (isLoading) {
        return <div className="skeleton hero-panoramic-banner-skeleton mb-4" />;
    }

    if (!items || items.length === 0) return null;

    return (
        <section className="hero-panoramic-banner mb-4">
            <div className="hero-panoramic-banner__container">
                <Swiper
                    modules={[Autoplay]}
                    onSwiper={setSwiperInstance}
                    onSlideChange={(swiper) => setRealIndex(swiper.realIndex)}
                    centeredSlides={true}
                    loop={items.length > 1}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                    }}
                    // На мобільних — 1 слайд на всю ширину екрану
                    slidesPerView={1}
                    spaceBetween={0}
                    // На десктопі відкриваємо бокові слайди
                    breakpoints={{
                        768: {
                            slidesPerView: 1.25,
                            spaceBetween: 16,
                        },
                        1200: {
                            slidesPerView: 1.4, 
                            spaceBetween: 24,
                        },
                        1600: {
                            slidesPerView: 1.45,
                            spaceBetween: 32,
                        }
                    }}
                    className="panoramic-banner-swiper"
                >
                    {items.map((item) => (
                        <SwiperSlide
                            key={item.id}
                            className="panoramic-banner-swiper__slide"
                            onClick={() => onBannerClick?.(item)}
                        >
                            <div className="panoramic-banner-card">
                                <img
                                    src={item.imageUrl}
                                    alt="Промо банер"
                                    loading="eager"
                                />
                                <div className="panoramic-banner-card__gradient" />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Мінімалістичні індикатори під слайдером */}
            {items.length > 1 && (
                <div className="hero-panoramic-banner__dots">
                    {items.map((item, i) => (
                        <button
                            key={item.id}
                            className={`hero-panoramic-banner__dot${i === realIndex ? ' hero-panoramic-banner__dot--active' : ''}`}
                            onClick={() => swiperInstance?.slideToLoop(i)}
                            aria-label={`Перейти до слайда ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};