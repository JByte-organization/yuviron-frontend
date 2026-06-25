'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // 🌟 Импортируем роутер для безопасных переходов по href
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
    const router = useRouter(); // Инициализируем инстанс роутера Next.js
    const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(null);
    const [realIndex, setRealIndex] = useState(0);

    if (isLoading) {
        return <div className="skeleton hero-panoramic-banner-skeleton mb-4" />;
    }

    if (!items || items.length === 0) return null;

    // 🌟 Единый безопасный обработчик клика по слайду (работает и с loop-клонами)
    const handleActionClick = (item: BannerItem) => {
        // Сначала вызываем внешнюю кастомную функцию, если она передана
        onBannerClick?.(item);

        // Если у банера задана ссылка — совершаем переход через роутер
        if (item.href) {
            router.push(item.href);
        }
    };

    return (
        <section className="hero-panoramic-banner mb-4">
            <div className="hero-panoramic-banner__container">
                <Swiper
                    modules={[Autoplay]}
                    onSwiper={setSwiperInstance}
                    // Гарантированно точный пересчет активной точки при смене слайда
                    onSlideChange={(swiper) => setRealIndex(swiper.realIndex)}
                    centeredSlides={true}
                    loop={items.length > 1}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                    }}
                    slidesPerView={1}
                    spaceBetween={0}
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
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleActionClick(item)} // Чистый клик без конфликтов с DOM Link
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

            {/* Минималистичные индикаторы под слайдером */}
            {items.length > 1 && (
                <div className="hero-panoramic-banner__dots">
                    {items.map((item, i) => (
                        <button
                            key={item.id}
                            className={`hero-panoramic-banner__dot${i === realIndex ? ' hero-panoramic-banner__dot--active' : ''}`}
                            onClick={() => swiperInstance?.slideToLoop(i)} // Переключение на правильный индекс с учетом зацикливания
                            aria-label={`Перейти до слайда ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};