'use client';

import React from 'react';
import Image from 'next/image';
import type { AdSummaryDto } from '@repo/api/admin.ts';
import { formatDate } from '@/shared/lib/formatDate';
import { formatNumber } from '@/shared/lib/formatNumber';
import { getImageUrl } from '@/shared/lib/getImageUrl';

interface AdRowProps {
    ad: AdSummaryDto;
    isSelected: boolean;
    isPlaying: boolean;
    isLoading: boolean;
    onSelect: () => void;
    onEdit: (ad: AdSummaryDto) => void;
    onDelete: (ad: AdSummaryDto) => void;
    onPlayToggle: (adId: string) => void;
    onToggleStatus: (ad: AdSummaryDto) => void;
}

const calculateCTR = (impressions?: number, clicks?: number): string => {
    if (!impressions || !clicks) return '0.00%';
    const ctr = (clicks / impressions) * 100;
    return `${ctr.toFixed(2)}%`;
};

export const AdRow = ({
                          ad,
                          isSelected,
                          isPlaying,
                          isLoading,
                          onSelect,
                          onEdit,
                          onDelete,
                          onPlayToggle,
                          onToggleStatus
                      }: AdRowProps) => {    const impressions = ad.impressionsCount ?? 0;
    const clicks = ad.clicksCount ?? 0;

    const rawAd = ad as any;
    const adImageUrl = getImageUrl(rawAd.imageUrl) || getImageUrl(rawAd.coverUrl);
    const adAudioUrl = rawAd.audioUrl;

    return (
        <tr className="admin-ads-row align-middle">
            <td className="px-4">
                <input
                    type="checkbox"
                    className="form-check-input bg-dark border-secondary shadow-none"
                    checked={isSelected}
                    onChange={onSelect}
                />
            </td>

            <td className="py-3">
                <div className="d-flex align-items-center gap-3">
                    <div
                        className="rounded overflow-hidden bg-secondary d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                            width: '45px',
                            height: '45px',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            background: adImageUrl ? 'transparent' : 'linear-gradient(135deg, #325B76, #212631)'
                        }}
                    >
                        {adImageUrl ? (
                            <img src={adImageUrl} alt={ad.advertiserName ?? 'Ad'} className="w-100 h-100 object-fit-cover" />
                        ) : (
                            <i className="bi bi-image text-secondary" style={{ fontSize: '1.1rem' }} />
                        )}
                    </div>

                    <div className="d-flex flex-column min-w-0">
                        <span className="text-white fw-semibold text-truncate">{ad.advertiserName || '—'}</span>
                        <span className="text-secondary small text-truncate" style={{ maxWidth: '200px' }}>
                            {ad.title || 'Без назви'}
                        </span>
                    </div>
                </div>
            </td>

            <td className="text-white-50 small font-monospace">
                <i className="bi bi-eye-fill text-info me-1" />
                {formatNumber(impressions)}
            </td>

            <td className="text-white-50 small font-monospace">
                <i className="bi bi-cursor-fill text-info me-1" />
                {formatNumber(clicks)}
            </td>

            <td className="text-cyan fw-semibold small font-monospace">
                {calculateCTR(impressions, clicks)}
            </td>

            <td className="text-center">
                <div className="form-check form-switch d-inline-block">
                    <input
                        className="form-check-input admin-ads-row__switch"
                        type="checkbox"
                        role="switch"
                        checked={ad.isActive ?? false}
                        onChange={() => onToggleStatus(ad)}
                        style={{ cursor: 'pointer' }}
                    />
                </div>
            </td>

            <td className="text-secondary small text-nowrap">
                {formatDate(ad.createdAt)}
            </td>

            <td className="px-4 text-end">
                <div className="d-flex justify-content-end gap-2">
                    <button
                        type="button"
                        className="btn btn-sm btn-secondary border-0 shadow-none d-flex align-items-center justify-content-center"
                        title={isPlaying ? 'Pause Advertisement' : 'Play Audio Clip'}
                        onClick={() => ad.id && onPlayToggle(ad.id)}
                        disabled={isLoading} // Блокуємо кнопку під час завантаження
                        style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                    >
                        {isLoading ? (
                            <span className="spinner-border spinner-border-sm text-cyan" role="status" style={{ width: '14px', height: '14px' }} />
                        ) : (
                            <i className={`bi ${isPlaying ? 'bi-pause-fill text-cyan' : 'bi-play-fill text-white'} fs-5`} />
                        )}
                    </button>

                    <button className="btn btn-sm btn-secondary border-0 shadow-none" onClick={() => onEdit(ad)} title="Edit Campaign">
                        <Image src="/images/icons/edit-btn.svg" width={16} height={16} alt="edit" />
                    </button>
                    <button className="btn btn-sm btn-secondary border-0 shadow-none" onClick={() => onDelete(ad)} title="Delete Campaign">
                        <Image src="/images/icons/delete-btn.svg" width={16} height={16} alt="delete" />
                    </button>
                </div>
            </td>
        </tr>
    );
};