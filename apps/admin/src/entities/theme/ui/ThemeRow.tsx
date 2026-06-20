'use client';

import React from 'react';
import Image from 'next/image';
import { type ThemeListItemDto } from '@repo/api/admin.ts';

interface ThemeRowProps {
    theme: ThemeListItemDto;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: (theme: ThemeListItemDto) => void;
    onDelete: (theme: ThemeListItemDto) => void;
}

export const ThemeRow = ({ theme, isSelected, onSelect, onEdit, onDelete }: ThemeRowProps) => {
    return (
        <tr className="align-middle">
            <td className="px-4">
                <input type="checkbox" className="form-check-input bg-dark border-secondary shadow-none" checked={isSelected} onChange={onSelect} />
            </td>
            <td>
                <span className="text-white fw-bold">{theme.name || 'Untitled Template'}</span>
                {theme.isSystem && <span className="badge bg-secondary ms-2" style={{ fontSize: '10px' }}>System</span>}
            </td>
            <td>
                <div
                    className="rounded-3 border border-secondary border-opacity-20 shadow-sm"
                    style={{
                        width: 48,
                        height: 28,
                        background: `linear-gradient(135deg, ${theme.backgroundColor || '#000'} 0%, ${theme.secondaryColor || '#000'} 50%, ${theme.primaryColor || '#000'} 100%)`
                    }}
                />
            </td>
            <td className="font-monospace text-cyan small">{theme.primaryColor?.toUpperCase() || '—'}</td>
            <td className="font-monospace text-info small">{theme.secondaryColor?.toUpperCase() || '—'}</td>
            <td className="font-monospace text-secondary small">{theme.backgroundColor?.toUpperCase() || '—'}</td>
            <td>
                {theme.isPremiumOnly ? (
                    <span className="badge bg-warning text-dark fw-bold px-2.5 py-1 rounded-pill" style={{ fontSize: '10px', letterSpacing: '0.3px' }}>
                        💎 PREMIUM
                    </span>
                ) : (
                    <span className="text-muted small">All Accounts</span>
                )}
            </td>
            <td className="px-4 text-end">
                <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-sm btn-secondary border-0 shadow-none" onClick={() => onEdit(theme)} title="Modify palette codes">
                        <Image src="/images/icons/edit-btn.svg" width={16} height={16} alt="edit" />
                    </button>
                    <button className="btn btn-sm btn-secondary border-0 shadow-none" onClick={() => onDelete(theme)} title="Remove layout matrix">
                        <Image src="/images/icons/delete-btn.svg" width={16} height={16} alt="delete" />
                    </button>
                </div>
            </td>
        </tr>
    );
};