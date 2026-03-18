export interface Album {
    id: string;
    title: string;
    artistId: string;
    releaseYear: number;
    imageUrl?: string;
    trackIds: string[];
}