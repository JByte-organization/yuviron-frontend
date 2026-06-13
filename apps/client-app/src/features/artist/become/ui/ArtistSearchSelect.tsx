'use client';

import { useEffect, useState } from 'react';
import {
    getGetApiSearchArtistsQueryKey,
    useGetApiSearchArtists,
    type SearchArtistDto,
    type SearchArtistDtoPaginatedList,
} from '@repo/api/client.ts';
import { getImageUrl } from '@/shared/lib/getImageUrl';

interface ArtistSearchSelectProps {
    onSelect: (artist: SearchArtistDto) => void;
}

// Поиск артиста по имени (debounce 300мс, запрос только от 2 символов).
export const ArtistSearchSelect = ({ onSelect }: ArtistSearchSelectProps) => {
    const [query, setQuery] = useState('');
    const [debounced, setDebounced] = useState('');

    useEffect(() => {
        const id = setTimeout(() => setDebounced(query.trim()), 300);
        return () => clearTimeout(id);
    }, [query]);

    const enabled = debounced.length >= 2;
    const params = { query: debounced, page: 1, pageSize: 20 };
    const { data, isFetching, isError } = useGetApiSearchArtists(params, {
        query: { enabled, queryKey: getGetApiSearchArtistsQueryKey(params) },
    });
    const items = (data as SearchArtistDtoPaginatedList | undefined)?.items ?? [];

    return (
        <div className="client-become-artist__search">
            <input
                type="text"
                className="client-become-artist__input"
                placeholder="Знайдіть себе за іменем артиста"
                value={query}
                autoFocus
                onChange={(event) => setQuery(event.target.value)}
            />

            {enabled && (
                <div className="client-become-artist__results">
                    {isError && (
                        <div className="client-become-artist__results-empty">
                            Не вдалося виконати пошук. Спробуйте ще раз.
                        </div>
                    )}
                    {!isError && isFetching && items.length === 0 && (
                        <div className="client-become-artist__results-empty">Пошук…</div>
                    )}
                    {!isError && !isFetching && items.length === 0 && (
                        <div className="client-become-artist__results-empty">Нічого не знайдено</div>
                    )}
                    {items.map((artist) => (
                        <button
                            type="button"
                            key={artist.id}
                            className="client-become-artist__result-row"
                            onClick={() => onSelect(artist)}
                        >
                            {artist.avatarUrl ? (
                                <img
                                    src={getImageUrl(artist.avatarUrl) ?? undefined}
                                    alt={artist.name ?? ''}
                                    className="client-become-artist__result-avatar"
                                />
                            ) : (
                                <span className="client-become-artist__result-avatar client-become-artist__result-avatar--placeholder">
                                    <i className="bi bi-person" />
                                </span>
                            )}
                            <span className="client-become-artist__result-name">{artist.name}</span>
                            <i className="bi bi-chevron-right client-become-artist__result-arrow" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ArtistSearchSelect;
