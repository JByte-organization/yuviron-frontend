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

const formatDate = (dateString?: string | null): string => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('uk-UA', {
        day:   '2-digit',
        month: '2-digit',
        year:  'numeric',
        hour:  '2-digit',
        minute:'2-digit'
    });
};

export const BannerRow = ({ banner, isSelected, onSelect, onEdit, onDelete }: BannerRowProps) => {
    const previewUrl = getImageUrl(banner.bannerUrl);

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

            <td className="py-2">
                <div className="rounded overflow-hidden bg-secondary d-flex align-items-center justify-content-center" style={{ width: 80, height: 45 }}>
                    {previewUrl ? (
                        <img src={previewUrl} alt={banner.title ?? 'Banner'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <i className="bi bi-image text-secondary" style={{ fontSize: 20 }} />
                    )}
                </div>
            </td>

            <td className="text-white fw-semibold">{banner.title || 'Untitled Campaign'}</td>

            <td className="text-center">
                {banner.isActive ? (
                    <span className="badge bg-success-subtle text-success border border-success border-opacity-25 px-2.5 py-1">Active</span>
                ) : (
                    <span className="badge bg-secondary-subtle text-secondary border border-secondary border-opacity-25 px-2.5 py-1">Inactive</span>
                )}
            </td>

            <td className="text-secondary small font-monospace">{formatDate(banner.startsAtUtc)}</td>
            <td className="text-secondary small font-monospace">{formatDate(banner.endsAtUtc)}</td>

            <td className="text-end px-4">
                <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-sm btn-secondary border-0 shadow-none" onClick={() => onEdit(banner)} title="Edit Configuration">
                        <Image src="/images/icons/edit-btn.svg" width={16} height={16} alt="edit" />
                    </button>
                    <button className="btn btn-sm btn-secondary border-0 shadow-none" onClick={() => onDelete(banner)} title="Delete Entity">
                        <Image src="/images/icons/delete-btn.svg" width={16} height={16} alt="delete" />
                    </button>
                </div>
            </td>
        </tr>
    );
};