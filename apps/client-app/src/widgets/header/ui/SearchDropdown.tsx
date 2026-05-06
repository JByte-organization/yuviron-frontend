'use client';

import React from 'react';
import Link from 'next/link';

type ResultType = 'track' | 'artist' | 'playlist';

interface SearchResult {
    id: string;
    type: ResultType;
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

const MOCK_ITEMS: SearchResult[] = [
    { id: '1', type: 'track',    title: 'Rockstar',         subtitle: 'LISA',       coverUrl: null },
    { id: '2', type: 'artist',   title: 'BLACKPINK',        subtitle: 'Виконавець', coverUrl: null },
    { id: '3', type: 'playlist', title: 'K-Pop Hits',       subtitle: '45 треків',  coverUrl: null },
    { id: '4', type: 'track',    title: 'Die With A Smile', subtitle: 'Lady Gaga',  coverUrl: null },
    { id: '5', type: 'artist',   title: 'Alyona Alyona',    subtitle: 'Виконавець', coverUrl: null },
];

// TODO: замінити на useGetApiSearch({ query })
function getMockResults(query: string): SearchResult[] {
    if (!query) return [];
    return MOCK_ITEMS.filter((r) =>
        r.title.toLowerCase().includes(query.toLowerCase())
    );
}

function getHref(result: SearchResult): string {
    if (result.type === 'track')    return '/tracks/' + result.id;
    if (result.type === 'artist')   return '/artists/' + result.id;
    if (result.type === 'playlist') return '/playlist/' + result.id;
    return '#';
}

function getTypeIcon(type: ResultType): string {
    if (type === 'track')    return 'bi-music-note';
    if (type === 'artist')   return 'bi-person';
    if (type === 'playlist') return 'bi-collection';
    return 'bi-music-note';
}

export const SearchDropdown = ({
                                   query,
                                   results,
                                   isLoading,
                                   onClose,
                               }: SearchDropdownProps) => {
    const displayResults = results.length > 0 ? results : getMockResults(query);

    if (!query) {
        return null;
    }

    const searchAllHref = '/search?q=' + encodeURIComponent(query);

    return (
        <div className="search-dropdown">

            {isLoading && (
                <div className="search-dropdown__loading">
                    <span className="spinner-border spinner-border-sm me-2" />
                    {'Пошук...'}
                </div>
            )}

            {!isLoading && displayResults.length === 0 && (
                <div className="search-dropdown__empty">
                    {'Нічого не знайдено для "' + query + '"'}
                </div>
            )}

            {!isLoading && displayResults.length > 0 && (
                <div>
                    <ul className="search-dropdown__list">
                        {displayResults.map((result) => {
                            const coverSrc = result.coverUrl
                                ? process.env.NEXT_PUBLIC_STORAGE_URL + '/' + result.coverUrl
                                : 'https://picsum.photos/seed/' + result.type + '-' + result.id + '/40/40';

                            const isArtist = result.type === 'artist';
                            const coverClass = 'search-dropdown__cover' + (isArtist ? ' search-dropdown__cover--round' : '');
                            const iconClass = 'bi ' + getTypeIcon(result.type) + ' search-dropdown__type-icon';

                            return (
                                <li key={result.id}>
                                    <Link
                                        href={getHref(result)}
                                        className="search-dropdown__item"
                                        onClick={onClose}
                                    >
                                        <div className={coverClass}>
                                            <img src={coverSrc} alt={result.title} />
                                        </div>
                                        <div className="search-dropdown__info">
                                            <span className="search-dropdown__title">{result.title}</span>
                                            {result.subtitle && (
                                                <span className="search-dropdown__subtitle">{result.subtitle}</span>
                                            )}
                                        </div>
                                        <i className={iconClass} />
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    <Link
                        href={searchAllHref}
                        className="search-dropdown__see-all"
                        onClick={onClose}
                    >
                        {'Показати всі результати для "' + query + '"'}
                        <i className="bi bi-arrow-right ms-2" />
                    </Link>
                </div>
            )}

        </div>
    );
};
