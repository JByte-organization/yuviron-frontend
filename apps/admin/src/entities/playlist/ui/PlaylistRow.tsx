'use client';

import React from 'react';
import { type PlaylistDto, PlaylistVisibility } from '@repo/api/admin.ts';
import {getImageUrl} from "@/shared/lib/getImageUrl";

interface Props {
    playlist: PlaylistDto;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: (playlist: PlaylistDto) => void;
    onDelete: (playlist: PlaylistDto) => void;
}

const formatDate = (dateString?: string): string => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });
};

const VisibilityBadge = ({ visibility }: { visibility?: string }) => {
    const map: Record<string, { cls: string }> = {
        Public:   { cls: 'bg-success' },
        Private:  { cls: 'bg-secondary' },
        Unlisted: { cls: 'bg-warning text-dark' },
    };
    const s = map[visibility ?? ''] ?? { cls: 'bg-secondary' };
    return <span className={`badge ${s.cls}`}>{visibility ?? '—'}</span>;
};

export const PlaylistRow = ({ playlist, isSelected, onSelect, onEdit, onDelete }: Props) => {

    const coverSrc = getImageUrl(playlist.coverUrl);

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
                        : <span className="text-white-50 small">🎶</span>
                    }
                </div>
            </td>

            {/* Title */}
            <td className="text-white fw-semibold text-nowrap">
                {playlist.title || '—'}
                {playlist.isEditorial && (
                    <span className="badge bg-info text-dark ms-2 small">Editorial</span>
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
                    ? <span className="text-success">✓</span>
                    : <span className="text-secondary">—</span>
                }
            </td>

            {/* Created */}
            <td className="text-secondary small text-nowrap">
                {formatDate(playlist.createdAt)}
            </td>

            {/* Actions */}
            <td className="px-4">
                <div className="d-flex justify-content-end gap-1">
                    <button
                        className="btn btn-sm btn-outline-warning border-0 shadow-none px-2"
                        title="Edit"
                        onClick={() => onEdit(playlist)}
                    >✏️</button>
                    <button
                        className="btn btn-sm btn-outline-danger border-0 shadow-none px-2"
                        title="Delete"
                        onClick={() => onDelete(playlist)}
                    >🗑️</button>
                </div>
            </td>
        </tr>
    );
};