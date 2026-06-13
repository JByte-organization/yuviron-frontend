import type { VerificationRequestListItemDto } from '@repo/api/admin.ts';

export const VERIFICATION_COLUMNS_MAP: Partial<Record<keyof VerificationRequestListItemDto, string>> = {
    artistName: 'Artist',
    submittedByUserEmail: 'Submitted By',
    claimedRole: 'Claimed Role',
    status: 'Status',
    createdAt: 'Created',
};

export const verificationTableColumns = Object.values(VERIFICATION_COLUMNS_MAP) as string[];
