'use client';

import React from 'react';
import { type TrackListItemDto, VisibilityStatus } from '@repo/api';
import {getImageUrl} from "@/shared/lib/getImageUrl";

interface Props {
    track: TrackListItemDto;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: (track: TrackListItemDto) => void;
    onDelete: (track: TrackListItemDto) => void;
}

const formatDuration = (ms?: number): string => {
    if (!ms) return '—';
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
};

const formatDate = (dateString?: string): string => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const StatusBadge = ({ status }: { status?: string }) => {
    const map: Record<string, { cls: string; label: string }> = {
        Published: { cls: 'bg-success',              label: 'Published' },
        Draft:     { cls: 'bg-secondary',             label: 'Draft'     },
        Scheduled: { cls: 'bg-warning text-dark',     label: 'Scheduled' },
        Hidden:    { cls: 'bg-danger',                label: 'Hidden'    },
    };
    const s = map[status ?? ''] ?? { cls: 'bg-secondary', label: status ?? '—' };
    return <span className={`badge ${s.cls}`}>{s.label}</span>;
};

export const TrackRow = ({ track, isSelected, onSelect, onEdit, onDelete }: Props) => {

    const coverSrc = getImageUrl(track.coverUrl);


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
                        : <span className="text-white-50 small">🎵</span>
                    }
                </div>
            </td>

            {/* Title + explicit */}
            <td className="text-white fw-semibold text-nowrap">
                {track.title || '—'}
                {track.explicit && (
                    <span className="badge bg-danger ms-2 small">E</span>
                )}
            </td>

            {/* Artists */}
            <td className="text-secondary small text-nowrap">
                {track.artistNames?.join(', ') || '—'}
            </td>

            {/* Album */}
            <td className="text-secondary small text-nowrap">
                {track.albumTitle || '—'}
            </td>

            {/* Duration */}
            <td className="text-secondary small text-nowrap">
                {formatDuration(track.durationMs)}
            </td>

            {/* Status */}
            <td><StatusBadge status={track.visibilityStatus} /></td>

            {/* Play count */}
            <td className="text-center text-white">
                {track.playCount ?? 0}
            </td>

            {/* Created */}
            <td className="text-secondary small text-nowrap">
                {formatDate(track.createdAt)}
            </td>

            {/* Actions */}
            <td className="px-4">
                <div className="d-flex justify-content-end gap-1">
                    <button
                        className="btn btn-sm btn-outline-warning border-0 shadow-none px-2"
                        title="Edit"
                        onClick={() => onEdit(track)}
                    >
                        ✏️
                    </button>
                    <button
                        className="btn btn-sm btn-outline-danger border-0 shadow-none px-2"
                        title="Delete"
                        onClick={() => onDelete(track)}
                    >
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    );
};