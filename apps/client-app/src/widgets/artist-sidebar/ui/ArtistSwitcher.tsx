'use client';

import React, { useState } from 'react';
import type { UserManagedArtistDto } from '@repo/api/client.ts';
import { useManagedArtists } from '@/entities/artist/model/managedArtists';
import { useCurrentArtistId, setStoredArtistId } from '@/entities/artist/model/currentArtist';
import { useSessionStore } from '@/entities/session/model/store';
import { getImageUrl } from '@/shared/lib/getImageUrl';

const Avatar = ({ artist }: { artist: UserManagedArtistDto | undefined }) =>
    artist?.avatarUrl ? (
        <img
            src={getImageUrl(artist.avatarUrl) ?? undefined}
            alt={artist.name ?? ''}
            className="client-sidebar__switcher-avatar"
        />
    ) : (
        <span className="client-sidebar__switcher-avatar client-sidebar__switcher-avatar--placeholder">
            <i className="bi bi-person" />
        </span>
    );

// Перемикач артистів — для юзерів, що керують кількома (label/manager). Пише вибір
// у scoped-localStorage через setStoredArtistId; useCurrentArtist підхоплює його як
// пріоритетний (якщо в списку managedArtists) і весь кабінет перемикається миттєво.
// При одному артисті не показуємо.
export const ArtistSwitcher = () => {
    const { artists } = useManagedArtists();
    const currentId = useCurrentArtistId();
    const userId = useSessionStore((s) => s.user?.id);
    const [open, setOpen] = useState(false);

    if (artists.length < 2) return null;

    const current = artists.find((a) => a.artistId === currentId) ?? artists[0];

    const select = (id: string | undefined) => {
        if (id && id !== currentId) setStoredArtistId(userId, id);
        setOpen(false);
    };

    return (
        <div className="client-sidebar__switcher">
            <button
                type="button"
                className="client-sidebar__switcher-toggle"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
            >
                <Avatar artist={current} />
                <span className="client-sidebar__switcher-name">{current?.name ?? 'Артист'}</span>
                <i className={`bi bi-chevron-${open ? 'up' : 'down'} client-sidebar__switcher-caret`} />
            </button>

            {open && (
                <div className="client-sidebar__switcher-menu" role="listbox">
                    {artists.map((a) => (
                        <button
                            key={a.artistId}
                            type="button"
                            role="option"
                            aria-selected={a.artistId === current?.artistId}
                            className="client-sidebar__switcher-item"
                            onClick={() => select(a.artistId)}
                        >
                            <Avatar artist={a} />
                            <span className="client-sidebar__switcher-name">{a.name}</span>
                            {a.role && <small className="client-sidebar__switcher-role">{a.role}</small>}
                            {a.artistId === current?.artistId && (
                                <i className="bi bi-check2 client-sidebar__switcher-check" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
