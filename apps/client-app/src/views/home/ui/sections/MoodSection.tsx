'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { MoodCard, type MoodCardData } from '@/entities/mood/ui/MoodCard';

import 'swiper/css';
import 'swiper/css/free-mode';

export type MoodFilterType = 'mood' | 'genre';

interface MoodSectionProps {
    moods?: MoodCardData[];
    genres?: MoodCardData[];
    isLoading?: boolean;
    isAuthenticated?: boolean;
}

export const MoodSection = ({ moods, genres, isLoading = false, isAuthenticated = false }: MoodSectionProps) => {
    const router = useRouter();
    const [filterType, setFilterType] = useState<MoodFilterType>('mood');
    const [activeId, setActiveId] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // ─── ОПТИМІЗАЦІЯ: Мемоізація вибору масиву даних ──────────────────
    const items = useMemo(() => {
        return filterType === 'mood' ? (moods ?? []) : (genres ?? []);
    }, [filterType, moods, genres]);

    // ─── ДИНАМІЧНИЙ ЗАГОЛОВОК (Залежно від типу фільтра) ─────────────
    const sectionTitle = useMemo(() => {
        if (filterType === 'mood') {
            return isAuthenticated ? 'Саундтреки на основі твого настрою' : 'Знайди музику за настроєм';
        }
        return isAuthenticated ? 'Музика під твої улюблені жанри' : 'Знайди музику за жанром';
    }, [filterType, isAuthenticated]);

    const highlightedWord = useMemo(() => (filterType === 'mood' ? 'настрою' : 'жанру'), [filterType]);

    // ─── МЕМОІЗОВАНІ ОБРОБНИКИ ПОДІЙ ─────────────────────────────────
    const handleItemClick = useCallback((id: string, name: string) => {
        setActiveId(id === activeId ? null : id);

        const targetPath = filterType === 'mood' ? 'moods' : 'genres';
        router.push(`/${targetPath}/${id}?title=${encodeURIComponent(name)}`);
    }, [activeId, filterType, router]);

    const handleFilterChange = useCallback((type: MoodFilterType) => {
        setFilterType(type);
        setActiveId(null);
        setDropdownOpen(false);
    }, []);

    const toggleDropdown = useCallback(() => setDropdownOpen(v => !v), []);
    const closeDropdown = useCallback(() => setDropdownOpen(false), []);

    if (!isLoading && items.length === 0) return null;

    const FilterDropdown = (
        <div className="mood-section__filter-wrap">
            <button className="mood-section__filter-btn" onClick={toggleDropdown}>
                {filterType === 'mood' ? 'Настрій' : 'Жанри'}
                <i className={`bi bi-chevron-${dropdownOpen ? 'up' : 'down'}`} />
            </button>

            {dropdownOpen && (
                <>
                    <div className="mood-section__dropdown-overlay" onClick={closeDropdown} />
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
                <div className="d-flex gap-3 overflow-hidden">
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
                        992: { slidesPerView: 6 },
                        1200: { slidesPerView: 8 },
                    }}
                    className="mood-section__swiper"
                >
                    {items.map(item => (
                        <SwiperSlide key={item.id} className="mood-section__swiper-slide">
                            <MoodCard
                                mood={item}
                                isActive={item.id === activeId}
                                onClick={(id) => handleItemClick(id, item.name)}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}
        </section>
    );
};