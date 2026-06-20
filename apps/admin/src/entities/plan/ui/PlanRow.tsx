'use client';

import React from 'react';
import Image from 'next/image';
import { type PlanListItemDto } from '@repo/api/admin.ts';

interface PlanRowProps {
    plan: PlanListItemDto;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: (plan: PlanListItemDto) => void;
    onDelete: (plan: PlanListItemDto) => void;
}

export const PlanRow = ({ plan, isSelected, onSelect, onEdit, onDelete }: PlanRowProps) => {
    return (
        <tr className="align-middle">
            <td className="px-4">
                <input
                    type="checkbox"
                    className="form-check-input bg-dark border-secondary shadow-none"
                    checked={isSelected}
                    onChange={onSelect}
                />
            </td>
            <td>
                <span className="text-white fw-bold">{plan.name || '—'}</span>
            </td>
            <td>
                <span className="text-cyan font-monospace fw-semibold">
                    {(plan.price ?? 0).toFixed(2)} {plan.currency ?? 'USD'}
                </span>
            </td>
            <td>
                <span className="badge bg-dark border border-secondary text-white-50">
                    {plan.period ?? 'Unknown'}
                </span>
            </td>
            <td>
                <span className="text-white-50 font-monospace small">
                    {(plan.activeSubscribersCount ?? 0).toLocaleString()}
                </span>
            </td>
            <td className="text-secondary small font-monospace">
                {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('uk-UA') : '—'}
            </td>
            <td className="px-4 text-end">
                <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-sm btn-secondary border-0 shadow-none" onClick={() => onEdit(plan)} title="Modify tier configuration">
                        <Image src="/images/icons/edit-btn.svg" width={16} height={16} alt="edit" />
                    </button>
                    <button className="btn btn-sm btn-secondary border-0 shadow-none" onClick={() => onDelete(plan)} title="Terminate pricing tier">
                        <Image src="/images/icons/delete-btn.svg" width={16} height={16} alt="delete" />
                    </button>
                </div>
            </td>
        </tr>
    );
};