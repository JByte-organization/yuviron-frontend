'use client';

import React from 'react';
import { useAuthGuard } from '@/shared/lib/useAuthGuard.tsx';
import type { CollectionSortOrder } from '@/shared/lib/useTrackCollection.ts';

interface PlaylistHeaderProps {
    breadcrumb: string;
    title: string;
    totalCount: number;
    systemName?: string;
    isCollectionPlaying: boolean;
    isSearchExpanded: boolean;
    setIsSearchExpanded: (val: boolean) => void;
    search: string;
    setSearch: (val: string) => void;
    sortOrder: CollectionSortOrder;
    sortButtonLabel: string;
    hideControls?: boolean;
    onPlayAll: () => void;
    onShufflePlay: () => void;
    onSortClick: () => void;
}

export const PlaylistHeader = ({
                                   breadcrumb,
                                   title,
                                   totalCount,
                                   systemName = 'Система Yuviron',
                                   isCollectionPlaying,
                                   isSearchExpanded,
                                   setIsSearchExpanded,
                                   search,
                                   setSearch,
                                   sortOrder,
                                   sortButtonLabel,
                                   hideControls = false,
                                   onPlayAll,
                                   onShufflePlay,
                                   onSortClick,
                               }: PlaylistHeaderProps) => {

    const { requireAuth } = useAuthGuard();
    const isCollectionEmpty = totalCount === 0;


    return (
        <div className="favorites-header">
            <p className="favorites-header__breadcrumb">{breadcrumb}</p>
            <h1 className="favorites-header__title">{title}</h1>

            <div className="favorites-header__meta d-flex align-items-center flex-wrap" style={{ minHeight: '24px' }}>
                <i className={`bi ${systemName === 'Система Yuviron' ? 'bi-music-note-list' : 'bi bi-person-fill'} me-1 text-accent`} />
                <span className="fw-semibold text-white ms-1">{systemName}</span>
                {!isCollectionEmpty && <span className="ms-2 text-muted">• {totalCount} тр.</span>}
            </div>

            {!isCollectionEmpty && (
                <>
                    <div className="favorites-header__actions d-flex align-items-center gap-3 mt-4">
                        <button
                            className={`favorites-header__btn favorites-header__btn--play${isCollectionPlaying ? ' favorites-header__btn--active' : ''}`}
                            onClick={() => requireAuth(onPlayAll)}
                            aria-label={isCollectionPlaying ? 'Pause' : 'Play'}
                        >
                            <i className={`bi ${isCollectionPlaying ? 'bi-pause-fill' : 'bi bi-play-fill'}`} />
                        </button>

                        <button className="favorites-header__btn favorites-header__btn--icon" onClick={() => requireAuth(onShufflePlay)} aria-label="Shuffle">
                            <i className="bi bi-shuffle" />
                        </button>

                        {/* 🌟 ЕСЛИ HIDE_CONTROLS === TRUE, БЛОК ПОИСКА И СОРТИРОВКИ НЕ РЕНДЕРИТСЯ */}
                        {!hideControls && (
                            <div className="ms-auto d-flex align-items-center gap-2">
                                <div className={`favorites-header__search-container d-flex align-items-center ${isSearchExpanded ? 'favorites-header__search-container--expanded' : ''}`}>
                                    <button className="favorites-header__btn favorites-header__btn--icon" onClick={() => setIsSearchExpanded(!isSearchExpanded)}>
                                        <i className="bi bi-search" />
                                    </button>
                                    {isSearchExpanded && (
                                        <input
                                            type="text" className="form-control form-control-sm bg-transparent border-0 text-white shadow-none favorites-header__search-input"
                                            placeholder="Пошук..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus style={{ width: '180px', fontSize: '0.85rem' }}
                                        />
                                    )}
                                </div>

                                <button className="favorites-header__sort btn btn-link p-0 text-decoration-none text-secondary d-flex align-items-center gap-2" onClick={onSortClick}>
                                    <span style={{ fontSize: '0.85rem' }}>{sortButtonLabel}</span>
                                    <i className={`bi ${sortOrder === 'asc' ? 'bi-sort-up' : 'bi bi-sort-down'}`} style={{ fontSize: '1.1rem' }} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="favorites-header__columns mt-4">
                        <div className="favorites-header__col-index">#</div>
                        <div className="favorites-header__col-title">Назва</div>
                        <div className="favorites-header__col-album d-none d-md-block">Альбом</div>
                        <div className="favorites-header__col-date d-none d-lg-block">{hideControls ? '' : 'Додатково'}</div>
                        <div className="favorites-header__col-duration"><i className="bi bi-clock" /></div>
                    </div>
                </>
            )}
        </div>
    );
};