import type { NotificationDto } from '../model/types';

// Иконка без хардкода данных: сначала по строковому ключу type (его задаёт бэк),
// иначе откатываемся к иконке по category, иначе — колокольчик.
const TYPE_ICONS: Record<string, string> = {
    artist_claim_approved: 'bi-patch-check-fill',
    artist_claim_rejected: 'bi-patch-exclamation-fill',
    artist_profile_created: 'bi-mic-fill',
    new_track: 'bi-music-note-beamed',
    new_release: 'bi-disc-fill',
    new_album: 'bi-disc-fill',
    friend_request: 'bi-person-plus-fill',
    playlist_update: 'bi-collection-fill',
};

const CATEGORY_ICONS: Record<string, string> = {
    System: 'bi-gear-fill',
    Music: 'bi-music-note',
    Social: 'bi-people-fill',
    Billing: 'bi-credit-card-fill',
};

export const iconForNotification = (n: NotificationDto): string =>
    TYPE_ICONS[n.type ?? ''] ?? CATEGORY_ICONS[n.category ?? ''] ?? 'bi-bell-fill';

// Относительное время по createdAt (UTC → локаль браузера).
export const formatRelativeTime = (createdAt?: string): string => {
    if (!createdAt) return '';
    const diff = Date.now() - new Date(createdAt).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Щойно';
    if (minutes < 60) return `${minutes} хв. тому`;
    if (hours < 24) return `${hours} год. тому`;
    if (days < 7) return `${days} дн. тому`;
    return new Date(createdAt).toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: 'long',
    });
};
