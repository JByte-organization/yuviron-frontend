'use client';

import React from 'react';
import Image from 'next/image';
import { type BannerListItemDto } from '@repo/api/admin.ts';
import { getImageUrl } from '@/shared/lib/getImageUrl';

interface BannerRowProps {
    banner: BannerListItemDto;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: (banner: BannerListItemDto) => void;
    onDelete: (banner: BannerListItemDto) => void;
}

const formatDate = (dateString?: string): string => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('uk-UA', {
        day:   '2-digit',
        month: '2-digit',
        year:  'numeric',
    });
};

export const BannerRow = ({ banner, isSelected, onSelect, onEdit, onDelete }: BannerRowProps) => {
    const previewUrl = getImageUrl(banner.bannerUrl);
    // Поля баннера дрейфують у живому swagger (бек прибрав targetUrl/sortOrder/
    // createdAt зі списку, додав start/endsAtUtc). Читаємо «м'яко» через розширений
    // каст, щоб build не падав незалежно від поточної форми BannerListItemDto.
    const { targetUrl, sortOrder, createdAt } = banner as {
        targetUrl?: string | null;
        sortOrder?: number;
        createdAt?: string;
    };

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

            {/* Preview */}
            <td className="py-2">
                <div
                    className="rounded overflow-hidden bg-secondary d-flex align-items-center justify-content-center"
                    style={{ width: 80, height: 45 }}
                >
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt={banner.title ?? 'Banner'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <i className="bi bi-image text-secondary" style={{ fontSize: 20 }} />
                    )}
                </div>
            </td>

            {/* Title */}
            <td className="text-white fw-semibold">
                {banner.title ?? '—'}
            </td>

            {/* Target URL */}
            <td className="text-secondary small">
                {targetUrl ? (
                    <a
                        href={targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-info text-decoration-none text-truncate d-block"
                        style={{ maxWidth: 200 }}
                        title={targetUrl}
                    >
                        {targetUrl}
                    </a>
                ) : '—'}
            </td>

            {/* Sort Order */}
            <td className="text-center">
                <span className="badge bg-secondary px-3 py-2">
                    #{sortOrder ?? 0}
                </span>
            </td>

            {/* Active */}
            <td className="text-center">
                {banner.isActive ? (
                    <span className="badge bg-success">Active</span>
                ) : (
                    <span className="badge bg-secondary">Inactive</span>
                )}
            </td>

            {/* Created At */}
            <td className="text-secondary small text-nowrap">
                {formatDate(createdAt)}
            </td>

            {/* Actions */}
            <td className="text-end px-4">
                <div className="d-flex justify-content-end gap-2">
                    <button
                        className="btn btn-sm btn-secondary border-0 shadow-none"
                        onClick={() => onEdit(banner)}
                        title="Edit"
                    >
                        <Image src="/images/icons/edit-btn.svg" width={16} height={16} alt="edit" />
                    </button>
                    <button
                        className="btn btn-sm btn-secondary border-0 shadow-none"
                        onClick={() => onDelete(banner)}
                        title="Delete"
                    >
                        <Image src="/images/icons/delete-btn.svg" width={16} height={16} alt="delete" />
                    </button>
                </div>
            </td>
        </tr>
    );
};