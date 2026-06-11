'use client';

import React from 'react';
import { type MoodDto } from '@repo/api/admin.ts';
import {getImageUrl} from "@/shared/lib/getImageUrl";

interface Props {
    mood: MoodDto;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: (mood: MoodDto) => void;
    onDelete: (mood: MoodDto) => void;
}

const formatDate = (dateString?: string): string => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export const MoodRow = ({ mood, isSelected, onSelect, onEdit, onDelete }: Props) => {

    const coverSrc = getImageUrl(mood.coverUrl);

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
                    className="rounded bg-dark d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                    style={{ width: '40px', height: '40px' }}
                >
                    {coverSrc
                        ? <img src={coverSrc} alt="cover" className="w-100 h-100 object-fit-cover" />
                        : <span className="text-white-50 small">🎭</span>
                    }
                </div>
            </td>

            {/* Name */}
            <td className="text-white fw-semibold text-nowrap">
                {mood.name || '—'}
            </td>

            {/* ID */}
            <td className="text-secondary small font-monospace" title={mood.id}>
                {mood.id ? `${mood.id.slice(0, 8)}…` : '—'}
            </td>

            {/* Tracks Count */}
            <td className="text-center text-white">
                {mood.tracksCount ?? 0}
            </td>

            {/* Created At */}
            <td className="text-secondary small text-nowrap">
                {formatDate(mood.createdAt)}
            </td>

            {/* Updated At */}
            <td className="text-secondary small text-nowrap">
                {formatDate(mood.updatedAt)}
            </td>

            {/* Actions */}
            <td className="px-4">
                <div className="d-flex justify-content-end gap-1">
                    <button
                        className="btn btn-sm btn-outline-warning border-0 shadow-none px-2"
                        title="Edit"
                        onClick={() => onEdit(mood)}
                    >
                        ✏️
                    </button>
                    <button
                        className="btn btn-sm btn-outline-danger border-0 shadow-none px-2"
                        title="Delete"
                        onClick={() => onDelete(mood)}
                    >
                        🗑️
                    </button>
                </div>
            </td>
        </tr>
    );
};