'use client';

import { useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { ShowAllButton } from '@/shared/ui/ShowAllButton';
import { TrackCard, type TrackCardData } from '@/entities/track/ui/TrackCard';

import 'swiper/css';
import 'swiper/css/free-mode';

// ─── Типи ─────────────────────────────────────────────────────────────────────
interface TopTracksSectionProps {
    sectionTitle?: string;
    tracks?: TrackCardData[];
    isLoading?: boolean;
    showAllHref?: string;
    // 🚨 ФІКС ОЧЕРЕДІ: Передаємо трек та його індекс для ініціалізації черги в плеєрі
    onTrackClick?: (track: TrackCardData, index: number) => void;
}

// ─── Компонент ────────────────────────────────────────────────────────────────
export const TopTracksSection = ({
                                     sectionTitle = 'Топ популярна музика',
                                     tracks = [], // Дефолтне значення, щоб уникнути undefined
                                     isLoading = false,
                                     showAllHref = '/tracks',
                                     onTrackClick,
                                 }: TopTracksSectionProps) => {

    if (!isLoading && (!tracks || tracks.length === 0)) return null;

    // Оптимізуємо розрахунок останнього слова через useMemo
    const lastWord = useMemo(() => {
        return sectionTitle.trim().split(' ').at(-1) ?? 'музика';
    }, [sectionTitle]);

    return (
        <section className="top-tracks-section mb-4 mb-md-5">
            <SectionHeader
                title={sectionTitle}
                highlightedWord={lastWord}
                showAll
                showAllHref={showAllHref}
            />

            {isLoading ? (
                <div className="d-flex gap-3 overflow-hidden">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} style={{ minWidth: 150, flex: '0 0 auto' }}>
                            <TrackCardSkeleton />
                        </div>
                    ))}
                </div>
            ) : (
                <Swiper
                    modules={[FreeMode]}
                    freeMode
                    // 🚨 ФІКС КНОПКИ: переводимо в auto, щоб ShowAllButton не летіла далеко
                    slidesPerView={2}
                    spaceBetween={24}
                    breakpoints={{
                        480:  { slidesPerView: 3 },
                        768:  { slidesPerView: 3 },
                        992:  { slidesPerView: 3 },
                        1200: { slidesPerView: 7 },
                    }}
                    className="top-tracks-section__swiper"
                >
                    {tracks.map((track, index) => (
                        // Додаємо унікальний клас для трек-слайдів, щоб контролювати їх ширину в SCSS
                        <SwiperSlide key={track.id} className="top-tracks-section__track-slide">
                            <TrackCard
                                track={track}
                                // Передаємо наверх індекс для плеєра
                                onClick={() => onTrackClick?.(track, index)}
                            />
                        </SwiperSlide>
                    ))}

                    {/* Слайд із кнопкою тепер буде притиснутий впритул з відступом 24px */}
                    <SwiperSlide className="top-tracks-section__show-all-slide align-items-center my-auto mx-0">
                        <ShowAllButton href={showAllHref} />
                    </SwiperSlide>
                </Swiper>
            )}
        </section>
    );
};

// ─── Скелетон ─────────────────────────────────────────────────────────────────
const TrackCardSkeleton = () => (
    <div>
        <div className="skeleton skeleton--rounded mb-2" style={{ aspectRatio: '1/1' }} />
        <div className="skeleton mb-1" style={{ height: 13, width: '75%' }} />
        <div className="skeleton" style={{ height: 11, width: '55%' }} />
    </div>
);