'use client';

import React from 'react';
import Image from 'next/image';
import type { TrackListItemDto } from '@repo/api/admin.ts';
import { formatDate } from '@/shared/lib/formatDate';
import { formatNumber } from '@/shared/lib/formatNumber';
import { getImageUrl } from '@/shared/lib/getImageUrl';

interface Props {
    track: TrackListItemDto;
    isSelected: boolean;
    isPlaying: boolean;
    isLoading: boolean;
    onSelect: () => void;
    onEdit: (track: TrackListItemDto) => void;
    onDelete: (track: TrackListItemDto) => void;
    onPlayToggle: (trackId: string) => void;
}

const formatDuration = (ms?: number): string => {
    if (!ms) return '—';
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
};

const StatusBadge = ({ status }: { status?: string }) => {
    const map: Record<string, { cls: string; label: string }> = {
        Published: { cls: 'admin-track-status--published', label: 'Published' },
        Draft:     { cls: 'admin-track-status--draft',     label: 'Draft'     },
        Scheduled: { cls: 'admin-track-status--scheduled', label: 'Scheduled' },
        Hidden:    { cls: 'admin-track-status--hidden',    label: 'Hidden'    },
    };
    const s = map[status ?? ''] ?? { cls: 'admin-track-status--draft', label: status ?? '—' };
    return <span className={`badge ${s.cls}`}>{s.label}</span>;
};

export const TrackRow = ({ track, isSelected, isPlaying, isLoading, onSelect, onEdit, onDelete, onPlayToggle }: Props) => {
    // 🚨 ФІКС КАРТИНКИ: Пропускаємо через хелпер для отримання повного шляху CDN
    const coverSrc = getImageUrl(track.coverUrl);

    return (
        <tr className="admin-tracks-row align-middle">
            <td className="px-4">
                <input
                    type="checkbox"
                    className="form-check-input bg-dark border-secondary shadow-none"
                    checked={isSelected}
                    onChange={onSelect}
                />
            </td>

            {/* Обложка трека */}
            <td className="py-3">
                <div
                    className="rounded overflow-hidden bg-secondary d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                        width: '40px',
                        height: '40px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        background: coverSrc ? 'transparent' : 'linear-gradient(135deg, #325B76, #212631)'
                    }}
                >
                    {coverSrc ? (
                        <img src={coverSrc} alt="cover" className="w-100 h-100 object-fit-cover" />
                    ) : (
                        <i className="bi bi-music-note text-secondary" style={{ fontSize: '1.1rem' }} />
                    )}
                </div>
            </td>

            <td>
                <div className="d-flex align-items-center gap-2">
                    <span className="text-white fw-semibold text-truncate" style={{ maxWidth: '220px' }}>
                        {track.title || '—'}
                    </span>
                    {track.explicit && (
                        <span className="badge bg-danger-subtle text-danger border border-danger border-opacity-25 small px-1.5 py-0.5" style={{ fontSize: '10px' }}>E</span>
                    )}
                </div>
            </td>

            <td className="text-secondary small text-truncate" style={{ maxWidth: '180px' }}>
                {track.artistNames?.join(', ') || '—'}
            </td>

            <td className="text-secondary small text-truncate" style={{ maxWidth: '180px' }}>
                {track.albumTitle || '—'}
            </td>

            <td className="text-secondary small font-monospace">
                {formatDuration(track.durationMs)}
            </td>

            <td><StatusBadge status={track.visibilityStatus} /></td>

            <td className="text-center text-white font-monospace">
                {formatNumber(track.playCount)}
            </td>

            <td className="text-secondary small text-nowrap">
                {formatDate(track.createdAt)}
            </td>

            {/* Блок дій */}
            <td className="px-4 text-end">
                <div className="d-flex justify-content-end gap-2">
                    {/* Кнопка Play/Pause з підтримкою лоадера */}
                    <button
                        className="btn btn-sm btn-secondary border-0 shadow-none d-flex align-items-center justify-content-center"
                        title={isPlaying ? 'Pause Track' : 'Play Track'}
                        onClick={() => track.id && onPlayToggle(track.id)}
                        disabled={isLoading}
                        style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                    >
                        {isLoading ? (
                            <span className="spinner-border spinner-border-sm text-cyan" role="status" style={{ width: '14px', height: '14px' }} />
                        ) : (
                            <i className={`bi ${isPlaying ? 'bi-pause-fill text-cyan' : 'bi-play-fill text-white'} fs-5`} />
                        )}
                    </button>

                    <button className="btn btn-sm btn-secondary border-0 shadow-none" title="Edit Track" onClick={() => onEdit(track)}>
                        <Image src="/images/icons/edit-btn.svg" width={16} height={16} alt="edit" />
                    </button>
                    <button className="btn btn-sm btn-secondary border-0 shadow-none" title="Delete Track" onClick={() => onDelete(track)}>
                        <Image src="/images/icons/delete-btn.svg" width={16} height={16} alt="delete" />
                    </button>
                </div>
            </td>
        </tr>
    );
};