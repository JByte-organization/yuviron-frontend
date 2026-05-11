'use client';

import React from 'react';
import Link from 'next/link';

interface SearchResult {
    id: string;
    type: 'track' | 'artist' | 'playlist';
    title: string;
    subtitle?: string;
    coverUrl?: string | null;
}

interface SearchDropdownProps {
    query: string;
    results: SearchResult[];
    isLoading: boolean;
    onClose: () => void;
}

// ─── Mock результати ──────────────────────────────────────
// TODO: замінити на useGetApiSearch({ query })
const getMockResults = (query: string): SearchResult[] => {
    if (!query) return [];

    const items: SearchResult[] = [
        { id: '1', type: 'track',    title: 'Rockstar',         subtitle: 'LISA',          coverUrl: null },
        { id: '2', type: 'artist',   title: 'BLACKPINK',        subtitle: 'Виконавець',    coverUrl: null },
        { id: '3', type: 'playlist', title: 'K-Pop Hits',       subtitle: '45 треків',     coverUrl: null },
        { id: '4', type: 'track',    title: 'Die With A Smile', subtitle: 'Lady Gaga',     coverUrl: null },
        { id: '5', type: 'artist',   title: 'Alyona Alyona',    subtitle: 'Виконавець',    coverUrl: null },
    ];

    return items.filter((r) => r.title.toLowerCase().includes(query.toLowerCase()));
};

const TYPE_ICONS: Record<SearchResult['type'], string> = {
    track:   'bi-music-note',
    artist:  'bi-person',
    playlist:'bi-collection',
};

const getHref = (result: SearchResult): string => {
    if (result.type === 'track')    return `/tracks/${result.id}`;
    if (result.type === 'artist')   return `/artists/${result.id}`;
    if (result.type === 'playlist') return `/playlist/${result.id}`;
    return '#';
};

export const SearchDropdown = ({
                                   query,
                                   results,
                                   isLoading,
                                   onClose,
                               }: SearchDropdownProps) => {
    // Використовуємо mock поки немає хука
    const displayResults = results.length > 0 ? results : getMockResults(query);

    if (!query) return null;

    return (
        <div className="search-dropdown">
            {isLoading ? (
                <div className="search-dropdown__loading">
                    <span className="spinner-border spinner-border-sm me-2" />
                    Пошук...
                </div>
            ) : displayResults.length === 0 ? (
                <div className="search-dropdown__empty">
                    Нічого не знайдено для «{query}»
                </div>
            ) : (
                <ul className="search-dropdown__list">
                    {displayResults.map((result) => {
                        const coverSrc = result.coverUrl
                            ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${result.coverUrl}`
                            : `https://picsum.photos/seed/${result.type}-${result.id}/40/40`;

                        return (
                            <li key={result.id}>
                                <Link
                                    href={getHref(result)}
                                    className="search-dropdown__item"
                                    onClick={onClose}
                                >
                                    <div className={`search-dropdown__cover${result.type === 'artist' ? ' search-dropdown__cover--round' : ''}`}>
                                        <img src={coverSrc} alt={result.title} />
                                    </div>
                                    <div className="search-dropdown__info">
                                        <span className="search-dropdown__title">{result.title}</span>
                                        {result.subtitle && (
                                            <span className="search-dropdown__subtitle">{result.subtitle}</span>
                                        )}
                                    </div>
                                    <i className={`bi ${TYPE_ICONS[result.type]} search-dropdown__type-icon`} />
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* Перейти на повний пошук */}
            {displayResults.length > 0 && (
                <Link
                    href={`/search?q=${encodeURIComponent(query)}`}
                    className="search-dropdown__see-all"
                    onClick={onClose}
                >
                    Показати всі результати для «{query}»
                    <i className="bi bi-arrow-right ms-2" />
                </Link>
            )}
        </div>
    );
};