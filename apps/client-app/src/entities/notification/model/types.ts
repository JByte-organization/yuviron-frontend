export type NotificationType =
    | 'new_track'
    | 'new_release'
    | 'upcoming_release'
    | 'friend_request';

export type NotificationGroup =
    | 'today'
    | 'this_week'
    | 'this_month'
    | 'earlier';

export type NotificationFilter = 'all' | 'tracks' | 'other';

export interface NotificationTrack {
    id: string;
    title: string;
    artistName: string;
    artistId?: string;
    coverUrl?: string | null;
}

export interface NotificationAlbum {
    id: string;
    title: string;
    artistName: string;
    artistId?: string;
    coverUrl?: string | null;
    releaseDate?: string | null;
}

export interface NotificationUser {
    id: string;
    name: string;
    avatarUrl?: string | null;
    isFriend: boolean;
}

export interface NotificationItem {
    id: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: string;
    group: NotificationGroup;
    track?: NotificationTrack | null;
    album?: NotificationAlbum | null;
    user?: NotificationUser | null;
}

export const GROUP_LABELS: Record<NotificationGroup, string> = {
    today:      'Сьогодні',
    this_week:  'Цього тижня',
    this_month: 'Цього місяця',
    earlier:    'Раніше',
};