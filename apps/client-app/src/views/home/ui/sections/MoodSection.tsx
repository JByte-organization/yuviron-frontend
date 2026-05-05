'use client';

import React, {useState, useRef, useCallback, useEffect} from 'react';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { MoodCard, type MoodCardData } from '@/entities/mood/ui/MoodCard';


export type MoodFilterType = 'mood' | 'genre';

interface MoodSectionProps {
    /** TODO: замінити на хук — useGetApiMoods() */
    moods?: MoodCardData[];
    /** TODO: замінити на хук — useGetApiGenres() */
    genres?: MoodCardData[];
    isLoading?: boolean;
    onMoodSelect?: (id: string) => void;
    onGenreSelect?: (id: string) => void;
}

const MOCK_MOODS: MoodCardData[] = [
    { id: '1', name: 'Хепні',      iconUrl: null },
    { id: '2', name: 'Меланхолія', iconUrl: null },
    { id: '3', name: 'Романтика',  iconUrl: null },
    { id: '4', name: 'Драйв',      iconUrl: null },
    { id: '5', name: 'Туса',       iconUrl: null },
    { id: '6', name: 'Спокій',     iconUrl: null },
    { id: '7', name: 'Енергія',    iconUrl: null },
];

const MOCK_GENRES: MoodCardData[] = [
    { id: '1', name: 'Поп',        iconUrl: null },
    { id: '2', name: 'Рок',        iconUrl: null },
    { id: '3', name: 'Джаз',       iconUrl: null },
    { id: '4', name: 'Класика',    iconUrl: null },
    { id: '5', name: 'Електронна', iconUrl: null },
    { id: '6', name: 'Хіп-хоп',   iconUrl: null },
    { id: '7', name: 'R&B',        iconUrl: null },
];

/**
 * Секція: "Саундтреки на основі твого настрою"
 *
 * Підключення даних:
 * 1. const { data: moodsData, isLoading } = useGetApiMoods();
 * 2. const { data: genresData } = useGetApiGenres();
 * 3. <MoodSection
 *      moods={moodsData?.items}
 *      genres={genresData?.items}
 *      isLoading={isLoading}
 *    />
 */
export const MoodSection = ({
                                moods = MOCK_MOODS,
                                genres = MOCK_GENRES,
                                isLoading = false,
                                onMoodSelect,
                                onGenreSelect,
                            }: MoodSectionProps) => {
    const [filterType, setFilterType] = useState<MoodFilterType>('mood');
    const [activeId, setActiveId] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // drag-scroll для мобайлу
    const sliderRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const items = filterType === 'mood' ? moods : genres;

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

    const onMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        startX.current = e.pageX - (sliderRef.current?.offsetLeft ?? 0);
        scrollLeft.current = sliderRef.current?.scrollLeft ?? 0;
    };
    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !sliderRef.current) return;
        e.preventDefault();
        const x = e.pageX - sliderRef.current.offsetLeft;
        sliderRef.current.scrollLeft = scrollLeft.current - (x - startX.current);
    };
    const onMouseUp = () => { isDragging.current = false; };

    const FilterDropdown = (
        <div className="mood-section__filter-wrap">
            <button
                className="mood-section__filter-btn"
                onClick={() => setDropdownOpen((v) => !v)}
            >
                {filterType === 'mood' ? 'Настрій' : 'Жанри'}
                <i className={`bi bi-chevron-${dropdownOpen ? 'up' : 'down'}`} />
            </button>

            {dropdownOpen && (
                <>
                    <div className="mood-section__dropdown-overlay" onClick={() => setDropdownOpen(false)} />
                    <div className="mood-section__dropdown">
                        {(['mood', 'genre'] as const).map((type) => (
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
        <section className="mood-section mb-4">
            <SectionHeader
                title={`Саундтреки на основі твого ${filterType === 'mood' ? 'настрою' : 'жанру'}`}
                highlightedWord={filterType === 'mood' ? 'настрою' : 'жанру'}
                rightSlot={FilterDropdown}
            />

            {isLoading ? (
                /* Skeleton — теж Bootstrap row */
                <div className="row g-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="col">
                            <div className="d-flex flex-column align-items-center gap-2 px-2">
                                <div className="skeleton skeleton--circle w-100" style={{ aspectRatio: '1/1' }} />
                                <div className="skeleton" style={{ height: 12, width: 60 }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /*
                 * Desktop: Bootstrap row — 5 рівних колонок (col)
                 * Mobile:  горизонтальний скрол — row flex-nowrap
                 */
                <div
                    ref={sliderRef}
                    className="row g-3 gap-3 flex-nowrap flex-lg-wrap mood-section__slider"
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                >
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="col-6 col-lg mood-section__slide"
                        >
                            <MoodCard
                                mood={item}
                                isActive={item.id === activeId}
                                onClick={handleItemClick}
                            />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};