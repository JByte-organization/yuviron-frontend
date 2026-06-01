'use client';

import React from 'react';

// ─── Типи ─────────────────────────────────────────────────────────────────────
interface PlaylistRecommendationsProps {
    playlistId: string;
    isOwner: boolean;
    onAddToPlaylist: (trackId: string, title: string) => void;
}

// ─── Компонент ────────────────────────────────────────────────────────────────
// TODO: замінити на реальні дані коли зʼявиться ендпоінт
// useGetApiPlaylistsIdRecommendations(playlistId)
//
// Поки що секція прихована — не показуємо порожній блок користувачу.
// Коли бекенд реалізує ендпоінт рекомендацій — розкоментувати і підключити хук.
export const PlaylistRecommendations = ({
                                            playlistId: _playlistId,
                                            isOwner: _isOwner,
                                            onAddToPlaylist: _onAddToPlaylist,
                                        }: PlaylistRecommendationsProps) => {
    // Ендпоінт рекомендацій ще не реалізований на бекенді
    return null;

    // ── Шаблон для підключення реальних даних ─────────────────────────────────
    // const { data, isLoading, refetch } = useGetApiPlaylistsIdRecommendations(_playlistId);
    // const tracks = (data as unknown as { items?: TrackRowData[] })?.items ?? [];
    //
    // if (isLoading || tracks.length === 0) return null;
    //
    // return (
    //     <section className="playlist-recommendations">
    //         <div className="playlist-recommendations__header">
    //             <div>
    //                 <h2 className="section-header__title">Рекомендації</h2>
    //                 <p className="playlist-recommendations__subtitle">
    //                     На основі ваших вподобань
    //                 </p>
    //             </div>
    //             <button
    //                 className="playlist-recommendations__refresh-btn"
    //                 onClick={() => refetch()}
    //                 aria-label="Оновити рекомендації"
    //             >
    //                 <i className="bi bi-arrow-clockwise" />
    //                 Оновити
    //             </button>
    //         </div>
    //         <div className="playlist-recommendations__list">
    //             {tracks.map((track) => (
    //                 <TrackRow
    //                     key={track.id}
    //                     track={track}
    //                     onLike={(id) => console.log('like', id)}
    //                     onAddToPlaylist={_isOwner
    //                         ? (id) => _onAddToPlaylist(id, track.title)
    //                         : undefined
    //                     }
    //                     showAddToPlaylist={_isOwner}
    //                 />
    //             ))}
    //         </div>
    //     </section>
    // );
};