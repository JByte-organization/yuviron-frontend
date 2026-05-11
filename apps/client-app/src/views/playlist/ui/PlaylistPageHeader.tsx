'use client';

import React, { useState } from 'react';

interface PlaylistInfo {
    id: string;
    name: string;
    description?: string | null;
    coverUrl?: string | null;
    ownerName: string;
    tracksCount: number;
    isSubscribed: boolean;
}

interface PlaylistPageHeaderProps {
    playlist: PlaylistInfo;
    isOwner: boolean;
    tracksCount: number;
    onPlay?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onShare?: () => void;
    onSubscribe?: () => void;
}

export const PlaylistPageHeader = ({
                                       playlist,
                                       isOwner,
                                       tracksCount,
                                       onPlay,
                                       onEdit,
                                       onDelete,
                                       onShare,
                                       onSubscribe,
                                   }: PlaylistPageHeaderProps) => {
    const [isSubscribed, setIsSubscribed] = useState(playlist.isSubscribed);
    const [menuOpen, setMenuOpen] = useState(false);

    const coverSrc = playlist.coverUrl
        ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${playlist.coverUrl}`
        : `https://picsum.photos/seed/playlist-${playlist.id}/200/200`;

    const handleSubscribe = () => {
        setIsSubscribed((v) => !v);
        onSubscribe?.();
        // TODO: usePostApiPlaylistsIdSubscribe()
    };

    return (
        <div className="playlist-page-header">
            {/* Breadcrumb */}
            <p className="playlist-page-header__breadcrumb">Плейліст</p>

            {/* Основний блок */}
            <div className="row align-items-end g-4 mb-4">
                <div className="col-auto">
                    <div className="playlist-page-header__cover">
                        <img src={coverSrc} alt={playlist.name} />
                    </div>
                </div>

                <div className="col">
                    <h1 className="playlist-page-header__title">{playlist.name}</h1>
                    {playlist.description && (
                        <p className="playlist-page-header__description">{playlist.description}</p>
                    )}
                    <p className="playlist-page-header__meta">
                        <span className="playlist-page-header__owner">{playlist.ownerName}</span>
                        <span className="playlist-page-header__dot">•</span>
                        <span>{tracksCount} треків</span>
                    </p>
                </div>
            </div>

            {/* Кнопки дій */}
            <div className="playlist-page-header__actions">
                {/* Play */}
                <button
                    className="playlist-page-header__btn playlist-page-header__btn--play"
                    onClick={onPlay}
                    aria-label="Відтворити"
                >
                    <i className="bi bi-play-fill" />
                </button>

                {isOwner ? (
                    <>
                        {/* Редагувати */}
                        <button
                            className="playlist-page-header__btn playlist-page-header__btn--icon"
                            onClick={onEdit}
                            aria-label="Редагувати"
                            title="Редагувати плейліст"
                        >
                            <i className="bi bi-pencil" />
                        </button>

                        {/* Видалити */}
                        <button
                            className="playlist-page-header__btn playlist-page-header__btn--icon"
                            onClick={onDelete}
                            aria-label="Видалити"
                            title="Видалити плейліст"
                        >
                            <i className="bi bi-trash" />
                        </button>

                        {/* Поділитися */}
                        <button
                            className="playlist-page-header__btn playlist-page-header__btn--icon"
                            onClick={onShare}
                            aria-label="Поділитися"
                            title="Поділитися плейлістом"
                        >
                            <i className="bi bi-share" />
                        </button>

                        {/* Додати соавтора */}
                        <button
                            className="playlist-page-header__btn playlist-page-header__btn--icon"
                            aria-label="Додати соавтора"
                            title="Додати соавтора"
                        >
                            <i className="bi bi-person-plus" />
                        </button>
                    </>
                ) : (
                    <>
                        {/* Підписатися / Відписатися */}
                        <button
                            className={`playlist-page-header__subscribe-btn${isSubscribed ? ' playlist-page-header__subscribe-btn--active' : ''}`}
                            onClick={handleSubscribe}
                        >
                            {isSubscribed ? 'Відписатися' : 'Підписатися'}
                        </button>

                        {/* Поділитися */}
                        <button
                            className="playlist-page-header__btn playlist-page-header__btn--icon"
                            onClick={onShare}
                            aria-label="Поділитися"
                        >
                            <i className="bi bi-share" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};