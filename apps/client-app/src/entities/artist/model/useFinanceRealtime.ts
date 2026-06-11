'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppNotifications } from '@/entities/notification/lib/useAppNotifications';
import type { NotificationDto } from '@/entities/notification/model/types';

// Realtime-шар для Фінансів. Архітектура бекенда — подієва (RabbitMQ + SignalR),
// тож на події біллінгу не поллимо, а робимо один фоновий рефреш кошелька/виплат
// та віддаємо наверх семантичні колбеки (конфетті/тост) — doc «Frontend + WebSockets».
//
// Бек шле пуш як NotificationDto через ReceiveNotification; розрізняємо за type:
//   payout_approved / payout_rejected / payout_paid / first_royalties.
// Будь-яка категорія Billing → тихий рефреш фінансових queries.
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

            // Фоновий рефреш цифр (інвалідуємо за URL-префіксом — exact:false).
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
