'use client';

import React from 'react';
import { type AlbumListItemDto, VisibilityStatus } from '@repo/api';

interface Props {
    album: AlbumListItemDto;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: (album: AlbumListItemDto) => void;
    onDelete: (album: AlbumListItemDto) => void;
}

const formatDate = (dateString?: string): string => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });
};

const StatusBadge = ({ status }: { status?: string }) => {
    const map: Record<string, { cls: string }> = {
        Published: { cls: 'bg-success' },
        Draft:     { cls: 'bg-secondary' },
        Scheduled: { cls: 'bg-warning text-dark' },
        Hidden:    { cls: 'bg-danger' },
    };
    const s = map[status ?? ''] ?? { cls: 'bg-secondary' };
    return <span className={`badge ${s.cls}`}>{status ?? '—'}</span>;
};

export const AlbumRow = ({ album, isSelected, onSelect, onEdit, onDelete }: Props) => {
    const coverSrc = album.coverUrl
        ? `https://api.yuviron.com/storage/${album.coverUrl}`
        : null;

    return (
        <tr className="border-bottom border-secondary align-middle" style={{ backgroundColor: '#212631' }}>

            <td className="px-4">
                <input
                    type="checkbox"
                    className="form-check-input bg-dark border-secondary shadow-none"
                    checked={isSelected}
                    onChange={onSelect}
                />
            </td>

            {/* Cover */}
            <td className="py-3">
                <div
                    className="rounded bg-secondary d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                    style={{ width: '40px', height: '40px' }}
                >
                    {coverSrc
                        ? <img src={coverSrc} alt="cover" className="w-100 h-100 object-fit-cover" />
                        : <span className="text-white-50 small">💿</span>
                    }
                </div>
            </td>

            {/* Title */}
            <td className="text-white fw-semibold text-nowrap">
                {album.title || '—'}
            </td>

            {/* Artists */}
            <td className="text-secondary small text-nowrap">
                {album.artists?.join(', ') || '—'}
            </td>

            {/* Tracks */}
            <td className="text-center text-white">
                {album.tracksCount ?? 0}
            </td>

            {/* Plays */}
            <td className="text-center text-white">
                {album.totalPlays ?? 0}
            </td>

            {/* Status */}
            <td><StatusBadge status={album.visibilityStatus} /></td>

            {/* Release Date */}
            <td className="text-secondary small text-nowrap">
                {formatDate(album.releaseDate)}
            </td>

            {/* Created */}
            <td className="text-secondary small text-nowrap">
                {formatDate(album.createdAt)}
            </td>

            {/* Actions */}
            <td className="px-4">
                <div className="d-flex justify-content-end gap-1">
                    <button
                        className="btn btn-sm btn-outline-warning border-0 shadow-none px-2"
                        title="Edit"
                        onClick={() => onEdit(album)}
                    >✏️</button>
                    <button
                        className="btn btn-sm btn-outline-danger border-0 shadow-none px-2"
                        title="Delete"
                        onClick={() => onDelete(album)}
                    >🗑️</button>
                </div>
            </td>
        </tr>
    );
};