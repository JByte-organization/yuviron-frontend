'use client';

import React from 'react';
import { type GenreListItemDto } from '@repo/api';
import {getImageUrl} from "@/shared/lib/getImageUrl";

interface Props {
    genre: GenreListItemDto;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: (genre: GenreListItemDto) => void;
    onDelete: (genre: GenreListItemDto) => void;
}

const formatDate = (dateString?: string): string => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
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
                    className="rounded bg-dark d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
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
            <td className="text-secondary small text-nowrap">
                {formatDate(genre.createdAt)}
            </td>

            {/* Updated At */}
            <td className="text-secondary small text-nowrap">
                {formatDate(genre.updatedAt)}
            </td>

            {/* Actions */}
            <td className="px-4">
                <div className="d-flex justify-content-end gap-1">
                    <button
                        className="btn btn-sm btn-outline-warning border-0 shadow-none px-2"
                        title="Edit"
                        onClick={() => onEdit(genre)}
                    >
                        ✏️
                    </button>
                    <button
                        className="btn btn-sm btn-outline-danger border-0 shadow-none px-2"
                        title="Delete"
                        onClick={() => onDelete(genre)}
                    >
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    );
};