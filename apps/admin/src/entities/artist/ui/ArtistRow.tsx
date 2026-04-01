import React from 'react';
import { ArtistListItemDto, VerificationStatus } from '@repo/api';

interface ArtistRowProps {
    artist: ArtistListItemDto;
}

export const ArtistRow = ({ artist }: ArtistRowProps) => {
    // Согласно паттерну "Временной зоны", файлы берем из /storage/ [cite: 1111]
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.yuviron.com';

    // Используем camelCase поля из твоего DTO
    const fullAvatarUrl = artist.avatarUrl
        ? `${API_URL}/storage/${artist.avatarUrl}`
        : '/placeholder-artist.png';

    const formatDate = (date?: string) =>
        date ? new Date(date).toLocaleDateString('ru-RU') : '—';

    const renderStatus = () => {
        // Статусы: 0 = None, 1 = Pending, 2 = Verified [cite: 191, 233]
        switch (artist.verificationStatus) {
            case VerificationStatus.Verified:
                return <span className="badge bg-success text-white">Verified</span>;
            case VerificationStatus.Pending:
                return <span className="badge bg-warning text-dark">Pending</span>;
            default:
                return <span className="badge bg-secondary text-white-50">None</span>;
        }
    };

    return (
        <tr className="border-bottom border-secondary align-middle" style={{ backgroundColor: '#212631' }}>
            <td className="px-4">
                <input type="checkbox" className="form-check-input bg-dark border-secondary shadow-none" />
            </td>

            {/* Имя и Аватар */}
            <td className="py-3">
                <div className="d-flex align-items-center gap-3">
                    <img
                        src={fullAvatarUrl}
                        alt="avatar"
                        className="rounded-circle object-fit-cover"
                        style={{ width: '35px', height: '35px' }}
                    />
                    <div className="text-white fw-bold">{artist.name || 'Unknown'}</div>
                </div>
            </td>

            {/* Email владельца */}
            <td className="text-secondary small">{artist.ownerEmail || 'No owner'}</td>

            {/* Статус */}
            <td>{renderStatus()}</td>

            {/* Кол-во альбомов */}
            <td className="text-white text-center">{artist.totalAlbums ?? 0}</td>

            {/* Дата создания */}
            <td className="text-secondary small text-nowrap">{formatDate(artist.createdAt)}</td>

            {/* Действия */}
            <td className="text-end px-4">
                <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-sm btn-outline-info border-0 shadow-none">✏️</button>
                    <button className="btn btn-sm btn-outline-danger border-0 shadow-none">❌</button>
                </div>
            </td>
        </tr>
    );
};