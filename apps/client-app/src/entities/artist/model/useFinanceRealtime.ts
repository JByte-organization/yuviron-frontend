'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppNotifications } from '@/entities/notification/lib/useAppNotifications';
import type { NotificationDto } from '@/entities/notification/model/types';

interface FinanceRealtimeHandlers {
    onPayoutApproved?: () => void;
    onFirstRoyalties?: () => void;
}

const isBilling = (n: NotificationDto): boolean =>
    n.category === 'Billing' ||
    (n.type ?? '').startsWith('payout_') ||
    n.type === 'first_royalties';

export const useFinanceRealtime = (handlers: FinanceRealtimeHandlers = {}) => {
    const qc = useQueryClient();
    const { onPayoutApproved, onFirstRoyalties } = handlers;

    const onReceive = useCallback(
        (n: NotificationDto) => {
            if (!isBilling(n)) return;

            void qc.invalidateQueries({ queryKey: ['/api/studio-artist/finance/wallet'] });
            void qc.invalidateQueries({ queryKey: ['/api/studio-artist/finance/payouts'] });
            void qc.invalidateQueries({ queryKey: ['/api/studio-artist/finance/transactions'] });

            if (n.type === 'first_royalties') onFirstRoyalties?.();
            if (n.type === 'payout_approved' || n.type === 'payout_paid') onPayoutApproved?.();
        },
        [qc, onPayoutApproved, onFirstRoyalties],
    );

    useAppNotifications(onReceive);
};
