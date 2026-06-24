'use client';

import React from 'react';
import Image from 'next/image';
import { type GenreListItemDto } from '@repo/api/admin.ts';
import { getImageUrl } from '@/shared/lib/getImageUrl';

interface Props {
    genre: GenreListItemDto;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: (genre: GenreListItemDto) => void;
    // Змінено назву пропса на onDelete для відповідності іншим рядкам
    onDelete: (genre: GenreListItemDto) => void;
}

const formatDate = (dateString?: string): string => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export const GenreRow = ({ genre, isSelected, onSelect, onEdit, onDelete }: Props) => {
    const coverSrc = getImageUrl(genre.coverUrl);

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
                    className="rounded bg-dark d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0 border border-secondary"
                    style={{ width: '40px', height: '40px' }}
                >
                    {coverSrc
                        ? <img src={coverSrc} alt="cover" className="w-100 h-100 object-fit-cover" />
                        : <span className="text-white-50 small">🎵</span>
                    }
                </div>
            </td>

            {/* Name */}
            <td className="text-white fw-semibold text-nowrap">
                {genre.name || '—'}
            </td>

            {/* ID */}
            <td className="text-secondary small font-monospace" title={genre.id}>
                {genre.id ? `${genre.id.slice(0, 8)}…` : '—'}
            </td>

            {/* Tracks Count */}
            <td className="text-center text-white">
                {genre.tracksCount ?? 0}
            </td>

            {/* Created At */}
            <td className="text-secondary small text-nowrap font-monospace">
                {formatDate(genre.createdAt)}
            </td>

            {/* Updated At */}
            <td className="text-secondary small text-nowrap font-monospace">
                {formatDate(genre.updatedAt)}
            </td>

            {/* Actions */}
            <td className="px-4 text-end">
                <div className="d-flex justify-content-end gap-2">
                    <button
                        className="btn btn-sm btn-secondary border-0 shadow-none"
                        title="Modify genre metadata"
                        onClick={() => onEdit(genre)}
                    >
                        <Image src="/images/icons/edit-btn.svg" width={16} height={16} alt="edit" />
                    </button>
                    <button
                        className="btn btn-sm btn-secondary border-0 shadow-none"
                        title="Delete genre grid level"
                        onClick={() => onDelete(genre)}
                    >
                        <Image src="/images/icons/delete-btn.svg" width={16} height={16} alt="delete" />
                    </button>
                </div>
            </td>
        </tr>
    );
};