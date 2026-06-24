'use client';

import React from 'react';
import { useAuthGuard } from '@/shared/lib/useAuthGuard';

interface CollectionActionsProps {
    isCollectionPlaying: boolean;
    onPlayAll: () => void;
    onShufflePlay: () => void;
    className?: string;
}

export const CollectionActions = ({
                                      isCollectionPlaying,
                                      onPlayAll,
                                      onShufflePlay,
                                      className = '',
                                  }: CollectionActionsProps) => {
    const { requireAuth } = useAuthGuard();

    return (
        <div className={`d-flex align-items-center gap-3 ${className}`}>
            {/* Большая кнопка Play/Pause */}
            <button
                className={`favorites-header__btn favorites-header__btn--play${isCollectionPlaying ? ' favorites-header__btn--active' : ''}`}
                onClick={() => requireAuth(onPlayAll)}
                aria-label={isCollectionPlaying ? 'Pause' : 'Play'}
            >
                <i className={`bi ${isCollectionPlaying ? 'bi-pause-fill' : 'bi bi-play-fill'}`} />
            </button>

            {/* Кнопка Shuffle */}
            <button
                className="favorites-header__btn favorites-header__btn--icon"
                onClick={() => requireAuth(onShufflePlay)}
                aria-label="Shuffle"
            >
                <i className="bi bi-shuffle" style={{ fontSize: '1.4rem' }} />
            </button>
        </div>
    );
};