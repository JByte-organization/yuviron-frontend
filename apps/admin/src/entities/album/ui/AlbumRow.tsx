'use client';

import React from 'react';
import Image from 'next/image';
import { type AlbumListItemDto } from '@repo/api/admin.ts';
import { getImageUrl } from '@/shared/lib/getImageUrl';

interface Props {
    album: AlbumListItemDto;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: (album: AlbumListItemDto) => void;
    onDelete: (album: AlbumListItemDto) => void;
}

const formatDate = (dateString?: string): string => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const StatusBadge = ({ status }: { status?: string }) => {
    const map: Record<string, { cls: string }> = {
        Published: { cls: 'bg-success' },
        Draft:     { cls: 'bg-secondary text-white-50' },
        Scheduled: { cls: 'bg-warning text-dark' },
        Hidden:    { cls: 'bg-danger' },
    };
    const s = map[status ?? ''] ?? { cls: 'bg-secondary' };
    return <span className={`badge ${s.cls} border border-secondary`}>{status ?? '—'}</span>;
};

export const AlbumRow = ({ album, isSelected, onSelect, onEdit, onDelete }: Props) => {
    const coverSrc = getImageUrl(album.coverUrl);

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
                    className="rounded bg-secondary d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0 border border-secondary"
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
                {album.artists && album.artists.length > 0
                    ? album.artists.map((artist: any) => artist.name).join(', ')
                    : '—'
                }
            </td>

            {/* Tracks */}
            <td className="text-center text-white">
                {album.tracksCount ?? 0}
            </td>

            {/* Plays */}
            <td className="text-center text-cyan font-monospace">
                {(album.totalPlays ?? 0).toLocaleString()}
            </td>

            {/* Status */}
            <td><StatusBadge status={album.visibilityStatus} /></td>

            {/* Release Date */}
            <td className="text-secondary small text-nowrap font-monospace">
                {formatDate(album.releaseDate)}
            </td>

            {/* Created */}
            <td className="text-secondary small text-nowrap font-monospace">
                {formatDate(album.createdAt)}
            </td>

            {/* Actions */}
            <td className="px-4 text-end">
                <div className="d-flex justify-content-end gap-2">
                    <button
                        className="btn btn-sm btn-secondary border-0 shadow-none"
                        onClick={() => onEdit(album)}
                        title="Modify album data"
                    >
                        <Image src="/images/icons/edit-btn.svg" width={16} height={16} alt="edit" />
                    </button>
                    <button
                        className="btn btn-sm btn-secondary border-0 shadow-none"
                        onClick={() => onDelete(album)}
                        title="Delete album tier"
                    >
                        <Image src="/images/icons/delete-btn.svg" width={16} height={16} alt="delete" />
                    </button>
                </div>
            </td>
        </tr>
    );
};