export interface Playlist {
    id: string;
    title: string;
    userId: string; // Владелец
    description?: string;
    isPublic: boolean;
    imageUrl?: string;
    trackIds: string[];
}