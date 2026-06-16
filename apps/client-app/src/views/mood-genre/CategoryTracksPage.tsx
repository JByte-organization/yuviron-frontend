'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { customInstance } from '@repo/api/client';
import { TrackRow } from '@/entities/track/ui/TrackRow';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import { PlaylistHeader } from '@/shared/ui/Playlist';
import { useTrackCollection } from '@/shared/lib/useTrackCollection';
import type { TrackRowData } from '@/entities/track/ui/TrackRow';
import type { SearchTrackDto, SearchTrackDtoPaginatedList, GetApiSearchTracksParams } from '@repo/api/client';

const PAGE_SIZE = 20;

export const CategoryTracksPage = () => {
    const searchParams = useSearchParams();
    const categoryTitle = searchParams.get('title') || 'Категорія';

    const [page, setPage] = useState(1);
    const [accumulatedTracks, setAccumulatedTracks] = useState<SearchTrackDto[]>([]);
    const [prevCategory, setPrevCategory] = useState(categoryTitle);

    // Сброс страниц
    if (categoryTitle !== prevCategory) {
        setPrevCategory(categoryTitle);
        setPage(1);
        setAccumulatedTracks([]);
    }

    const queryParams: GetApiSearchTracksParams = useMemo(() => ({
        query: categoryTitle, page, pageSize: PAGE_SIZE,
    }), [categoryTitle, page]);

    const { data, isLoading, isFetching, isError } = useQuery<SearchTrackDtoPaginatedList>({
        queryKey: ['api', 'search', 'tracks', queryParams],
        queryFn: ({ signal }) => customInstance<SearchTrackDtoPaginatedList>(
            `/api/search/tracks?query=${encodeURIComponent(queryParams.query || '')}&page=${queryParams.page}&pageSize=${queryParams.pageSize}`,
            { method: 'GET', signal }
        ),
        enabled: !!categoryTitle,
    });

    const [prevData, setPrevData] = useState<SearchTrackDtoPaginatedList | undefined>(undefined);
    if (data !== prevData) {
        setPrevData(data);
        if (data?.items) {
            setAccumulatedTracks(prev => {
                const existingIds = new Set(prev.map(t => t.id));
                const uniqueNewItems = data.items!.filter(t => t.id && !existingIds.has(t.id));
                return [...prev, ...uniqueNewItems];
            });
        }
    }

    const rawTracks: TrackRowData[] = useMemo(() => {
        return accumulatedTracks.map((t, i) => ({
            id: t.id ?? '', index: i + 1, title: t.title ?? '—',
            artistNames: (t.artists ?? []).map(a => a.name ?? '—'),
            coverUrl: getImageUrl(t.coverUrl), isSaved: t.isSaved ?? false,
        }));
    }, [accumulatedTracks]);

    const {
        search, setSearch, sortOrder, isSearchExpanded, setIsSearchExpanded,
        processedTracks, isCollectionPlaying, sortButtonLabel,
        handlePlayAll, handleShufflePlay, handleSortClick
    } = useTrackCollection({
        rawTracks,
        sourceType: 'Playlist',
        sourceId: `category-${categoryTitle}`
    });

    return (
        <div className="category-tracks-page py-4">
            <div className="container-fluid px-lg-4">
                <PlaylistHeader
                    breadcrumb="Плейліст за категорією" title={categoryTitle} totalCount={data?.totalCount ?? 0}
                    isCollectionPlaying={isCollectionPlaying} isSearchExpanded={isSearchExpanded}
                    setIsSearchExpanded={setIsSearchExpanded} search={search} setSearch={setSearch}
                    sortOrder={sortOrder} sortButtonLabel={sortButtonLabel}
                    onPlayAll={handlePlayAll} onShufflePlay={handleShufflePlay} onSortClick={handleSortClick}
                />

                <div className="favorites-page__list mt-2">
                    {isLoading && page === 1 ? <CategoryTracksSkeleton /> : isError ? (
                        <div className="text-center py-5 text-danger small">Не вдалося завантажити треки.</div>
                    ) : processedTracks.length === 0 ? (
                        <div className="favorites-page__empty text-center py-5"><p className="text-secondary mt-2">Нічого не знайдено</p></div>
                    ) : (
                        processedTracks.map(track => <TrackRow key={track.id} track={track} allTracks={processedTracks} />)
                    )}
                </div>

                {data?.hasNextPage && processedTracks.length > 0 && !search.trim() && (
                    <div className="d-flex justify-content-center mt-5">
                        <button className="yuviron-btn-minimal px-5 py-2.5" onClick={() => !isFetching && setPage(p => p + 1)} disabled={isFetching}>
                            {isFetching ? 'Підзавантаження...' : 'Показати ще'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


const CategoryTracksSkeleton = () => (
    <>
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="track-row opacity-50">
                <div className="skeleton" style={{ width: 20, height: 16 }} />
                <div className="d-flex align-items-center gap-3 flex-grow-1">
                    <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 4 }} />
                    <div>
                        <div className="skeleton mb-1" style={{ width: 140, height: 14 }} />
                        <div className="skeleton" style={{ width: 100, height: 12 }} />
                    </div>
                </div>
                <div className="skeleton d-none d-md-block" style={{ width: 120, height: 14 }} />
                <div className="skeleton d-none d-lg-block" style={{ width: 80, height: 14 }} />
                <div className="skeleton" style={{ width: 40, height: 14 }} />
            </div>
        ))}
    </>
);