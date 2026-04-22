'use client';

import React from 'react';
import {ArtistListItemDto, UserListItemDto, VerificationStatus} from '@repo/api';

interface ArtistRowProps {
    artist: ArtistListItemDto;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: (user: ArtistListItemDto) => void;
    onDelete: (artist: ArtistListItemDto) => void;
}

export const ArtistRow = ({ artist, isSelected, onSelect, onDelete, onEdit }: ArtistRowProps) => {

    // Хелпер для статуса верификации
    const renderVerificationStatus = (status?: VerificationStatus) => {
        const s = String(status);
        const isVerified = s === 'Verified' || s === '1';
        const isPending = s === 'Pending' || s === '0';

        return (
            <span className={`badge ${isVerified ? 'bg-success' : isPending ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                {s}
            </span>
        );
    };

    // Путь к аватару
    const avatarSrc = artist.avatarUrl
        ? `https://api.yuviron.com/storage/${artist.avatarUrl}`
        : null;

    return (
        <tr className="border-bottom border-secondary align-middle" style={{backgroundColor: '#212631'}}>
            <td className="px-4">
                <input
                    type="checkbox"
                    className="form-check-input bg-dark border-secondary shadow-none"
                    checked={isSelected}
                    onChange={onSelect}
                />
            </td>

            {/* Avatar + Name */}
            <td className="py-3">
                <div className="d-flex align-items-center gap-3">
                    <div
                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center overflow-hidden"
                        style={{width: '35px', height: '35px', flexShrink: 0}}
                    >
                        {avatarSrc ? (
                            <img src={avatarSrc} alt="avatar" className="w-100 h-100 object-fit-cover"/>
                        ) : (
                            <span className="text-white-50 small">{artist.name?.charAt(0)}</span>
                        )}
                    </div>
                </div>
            </td>

            <td className="py-3">
                <div className="d-flex align-items-center gap-3">
                    <div className="text-white fw-bold text-nowrap">
                        {artist.name || 'Unknown Artist'}
                    </div>
                </div>
            </td>

            {/* ID */}
            <td className="text-secondary small font-monospace">
                {artist.id ? `${artist.id.slice(0, 8)}...` : 'N/A'}
            </td>

            {/* Owner Email */}
            <td className="text-secondary small">
                {artist.ownerEmail || '—'}
            </td>

            {/* Status */}
            <td>
                {renderVerificationStatus(artist.verificationStatus)}
            </td>

            {/* Total Albums */}
            <td className="text-center text-white">
                {artist.totalAlbums ?? 0}
            </td>

            {/* Created At */}
            <td className="text-secondary small">
                {artist.createdAt ? new Date(artist.createdAt).toLocaleDateString('ru-RU') : '—'}
            </td>

            {/* Actions */}
            <td className="text-end px-4">
                <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-sm btn-outline-info border-0 shadow-none"
                    onClick={() => onEdit(artist)}
                    >
                        ✏️
                    </button>
                    <button
                        className="btn btn-sm btn-outline-danger border-0 shadow-none"
                        onClick={() => onDelete(artist)}
                    >
                        ❌
                    </button>
                </div>
            </td>
        </tr>
    );
};