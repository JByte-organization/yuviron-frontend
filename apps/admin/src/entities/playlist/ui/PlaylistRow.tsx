'use client';

import React from 'react';
import Image from 'next/image';
import { type PlaylistDto } from '@repo/api/admin.ts';
import { getImageUrl } from '@/shared/lib/getImageUrl';

interface Props {
    playlist: PlaylistDto;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: (playlist: PlaylistDto) => void;
    onDelete: (playlist: PlaylistDto) => void;
}

const formatDate = (dateString?: string): string => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const VisibilityBadge = ({ visibility }: { visibility?: string }) => {
    const map: Record<string, { cls: string }> = {
        Public:   { cls: 'bg-success' },
        Private:  { cls: 'bg-secondary text-white-50' },
        Unlisted: { cls: 'bg-warning text-dark' },
    };
    const s = map[visibility ?? ''] ?? { cls: 'bg-secondary' };
    return <span className={`badge ${s.cls} border border-secondary`}>{visibility ?? '—'}</span>;
};

export const PlaylistRow = ({ playlist, isSelected, onSelect, onEdit, onDelete }: Props) => {
    const coverSrc = getImageUrl(playlist.coverUrl);

    return (
        <tr className="border-bottom border-secondary align-middle" style={{ backgroundColor: '#212631' }}>

            {/* Checkbox */}
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
                        : <span className="text-white-50 small">🎶</span>
                    }
                </div>
            </td>

            {/* Title */}
            <td className="text-white fw-semibold text-nowrap">
                {playlist.title || '—'}
                {playlist.isEditorial && (
                    <span className="badge bg-info text-dark ms-2 small fw-bold">Editorial</span>
                )}
            </td>

            {/* Creator */}
            <td className="text-secondary small text-nowrap">
                {playlist.creatorName || '—'}
            </td>

            {/* Visibility */}
            <td><VisibilityBadge visibility={playlist.visibility} /></td>

            {/* Tracks */}
            <td className="text-center text-white">
                {playlist.tracksCount ?? 0}
            </td>

            {/* Editorial */}
            <td className="text-center">
                {playlist.isEditorial
                    ? <span className="text-success fw-bold">✓</span>
                    : <span className="text-secondary">—</span>
                }
            </td>

            {/* Created */}
            <td className="text-secondary small text-nowrap font-monospace">
                {formatDate(playlist.createdAt)}
            </td>

            {/* Actions */}
            <td className="px-4 text-end">
                <div className="d-flex justify-content-end gap-2">
                    <button
                        className="btn btn-sm btn-secondary border-0 shadow-none"
                        title="Modify playlist configuration"
                        onClick={() => onEdit(playlist)}
                    >
                        <Image src="/images/icons/edit-btn.svg" width={16} height={16} alt="edit" />
                    </button>
                    <button
                        className="btn btn-sm btn-secondary border-0 shadow-none"
                        title="Delete playlist grid tier"
                        onClick={() => onDelete(playlist)}
                    >
                        <Image src="/images/icons/delete-btn.svg" width={16} height={16} alt="delete" />
                    </button>
                </div>
            </td>
        </tr>
    );
};