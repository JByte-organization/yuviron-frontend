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
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Період показу банера (нова модель замість sortOrder): startsAtUtc → endsAtUtc.
// null-межі: без початку = «з моменту активації», без кінця = «безстроково».
const formatPeriod = (start?: string | null, end?: string | null): string => {
    if (!start && !end) return 'Завжди';
    return `${start ? formatDate(start) : '—'} – ${end ? formatDate(end) : '∞'}`;
};

// Статус показу: поєднання isActive і вікна дат (зараз/заплановано/завершено).
const computeStatus = (
    isActive: boolean | undefined,
    start?: string | null,
    end?: string | null,
): { label: string; cls: string } => {
    if (!isActive) return { label: 'Inactive', cls: 'bg-secondary' };
    const now = Date.now();
    if (start && new Date(start).getTime() > now) return { label: 'Scheduled', cls: 'bg-info' };
    if (end && new Date(end).getTime() < now) return { label: 'Expired', cls: 'bg-warning text-dark' };
    return { label: 'Active', cls: 'bg-success' };
};

export const BannerRow = ({ banner, isSelected, onSelect, onEdit, onDelete }: BannerRowProps) => {
    const previewUrl = getImageUrl(banner.bannerUrl);
    const status = computeStatus(banner.isActive, banner.startsAtUtc, banner.endsAtUtc);

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

            {/* Period (start → end) */}
            <td className="text-secondary small text-nowrap">
                {formatPeriod(banner.startsAtUtc, banner.endsAtUtc)}
            </td>

            {/* Status */}
            <td className="text-center">
                <span className={`badge ${status.cls}`}>{status.label}</span>
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
