export interface User {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
    subscriptionPlan: 'FREE' | 'PREMIUM';
    favoriteTracksCount: number;
}