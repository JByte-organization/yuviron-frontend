'use client';

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { MoodCard, type MoodCardData } from '@/entities/mood/ui/MoodCard';

// Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';

export type MoodFilterType = 'mood' | 'genre';

interface MoodSectionProps {
    moods?: MoodCardData[];
    genres?: MoodCardData[];
    title?: string;
    isLoading?: boolean;
    onMoodSelect?: (id: string) => void;
    onGenreSelect?: (id: string) => void;
}

export const MoodSection = ({
                                moods,
                                genres,
                                title,
                                isLoading = false,
                                onMoodSelect,
                                onGenreSelect,
                            }: MoodSectionProps) => {
    const [filterType,  setFilterType]   = useState<MoodFilterType>('mood');
    const [activeId,    setActiveId]     = useState<string | null>(null);
    const [dropdownOpen,setDropdownOpen] = useState(false);

    const items = filterType === 'mood' ? (moods ?? []) : (genres ?? []);

    if (!isLoading && items.length === 0) return null;

    const handleItemClick = (id: string) => {
        setActiveId(id === activeId ? null : id);
        if (filterType === 'mood') onMoodSelect?.(id);
        else onGenreSelect?.(id);
    };

    const handleFilterChange = (type: MoodFilterType) => {
        setFilterType(type);
        setActiveId(null);
        setDropdownOpen(false);
    };

    const sectionTitle    = title ?? `Саундтреки на основі твого ${filterType === 'mood' ? 'настрою' : 'жанру'}`;
    const highlightedWord = filterType === 'mood' ? 'настрою' : 'жанру';

    const FilterDropdown = (
        <div className="mood-section__filter-wrap">
            <button
                className="mood-section__filter-btn"
                onClick={() => setDropdownOpen(v => !v)}
            >
                {filterType === 'mood' ? 'Настрій' : 'Жанри'}
                <i className={`bi bi-chevron-${dropdownOpen ? 'up' : 'down'}`} />
            </button>

            {dropdownOpen && (
                <>
                    <div
                        className="mood-section__dropdown-overlay"
                        onClick={() => setDropdownOpen(false)}
                    />
                    <div className="mood-section__dropdown">
                        {(['mood', 'genre'] as const).map(type => (
                            <button
                                key={type}
                                className={`mood-section__dropdown-item${filterType === type ? ' mood-section__dropdown-item--active' : ''}`}
                                onClick={() => handleFilterChange(type)}
                            >
                                {type === 'mood' ? 'Настрій' : 'Жанри'}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );

    return (
        <section className="mood-section mb-4 mb-md-5">
            <SectionHeader
                title={sectionTitle}
                highlightedWord={highlightedWord}
                rightSlot={FilterDropdown}
            />

            {isLoading ? (
                <div className="d-flex gap-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="d-flex flex-column align-items-center gap-2" style={{ minWidth: 100 }}>
                            <div className="skeleton skeleton--circle" style={{ width: 80, height: 80 }} />
                            <div className="skeleton" style={{ height: 12, width: 60 }} />
                        </div>
                    ))}
                </div>
            ) : (
                <Swiper
                    modules={[FreeMode]}
                    freeMode
                    slidesPerView={2}
                    spaceBetween={35}
                    breakpoints={{
                        576: { slidesPerView: 3 },
                        768: { slidesPerView: 5 },
                        992: { slidesPerView: 5 },
                        1200: { slidesPerView: 8 },
                    }}
                    className="mood-section__swiper"
                >
                    {items.map(item => (
                        <SwiperSlide
                            key={item.id}
                            className="mood-section__swiper-slide"
                        >
                            <MoodCard
                                mood={item}
                                isActive={item.id === activeId}
                                onClick={handleItemClick}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}
        </section>
    );
};