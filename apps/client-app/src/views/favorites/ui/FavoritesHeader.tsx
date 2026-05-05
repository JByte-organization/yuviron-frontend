'use client';

import React from 'react';

interface FavoritesHeaderProps {
    /** TODO: підключити до плеєра */
    onPlay?: () => void;
    onShuffle?: () => void;
    onDownload?: () => void;
    onSearch?: () => void;
    tracksCount?: number;
}

export const FavoritesHeader = ({
                                    onPlay,
                                    onShuffle,
                                    onDownload,
                                    onSearch,
                                    tracksCount,
                                }: FavoritesHeaderProps) => {
    return (
        <div className="favorites-header">
            {/* Breadcrumb */}
            <p className="favorites-header__breadcrumb">
                Плейліст
            </p>

            {/* Заголовок */}
            <h1 className="favorites-header__title">Улюблені треки</h1>

            {/* Мета інфо */}
            <p className="favorites-header__meta">
                <i className="bi bi-person-fill me-1" />
                {/* TODO: підключити ім'я користувача */}
                Користувач
                {tracksCount !== undefined && (
                    <span className="ms-2 text-muted">• {tracksCount} тр.</span>
                )}
            </p>

            {/* Кнопки дій */}
            <div className="favorites-header__actions">
                <button
                    className="favorites-header__btn favorites-header__btn--play"
                    onClick={onPlay}
                    aria-label="Play"
                >
                    <i className="bi bi-play-fill" />
                </button>

                <button
                    className="favorites-header__btn favorites-header__btn--icon"
                    onClick={onShuffle}
                    aria-label="Shuffle"
                >
                    <i className="bi bi-shuffle" />
                </button>

                <button
                    className="favorites-header__btn favorites-header__btn--icon"
                    onClick={onDownload}
                    aria-label="Download"
                >
                    <i className="bi bi-arrow-down-circle" />
                </button>

                {/* Права частина */}
                <div className="ms-auto d-flex align-items-center gap-3">
                    <button
                        className="favorites-header__btn favorites-header__btn--icon"
                        onClick={onSearch}
                        aria-label="Search"
                    >
                        <i className="bi bi-search" />
                    </button>

                    {/* TODO: сортування */}
                    <button className="favorites-header__sort">
                        Дата додавання
                        <i className="bi bi-list ms-2" />
                    </button>
                </div>
            </div>

            {/* Заголовки колонок */}
            <div className="favorites-header__columns">
                <div className="favorites-header__col-index">#</div>
                <div className="favorites-header__col-title">Назва</div>
                <div className="favorites-header__col-album d-none d-md-block">Альбом</div>
                <div className="favorites-header__col-date d-none d-lg-block">Дата додавання</div>
                <div className="favorites-header__col-duration">
                    <i className="bi bi-clock" />
                </div>
            </div>
        </div>
    );
};