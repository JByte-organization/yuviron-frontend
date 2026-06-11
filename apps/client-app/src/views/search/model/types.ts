export type SearchFilter =
    | 'all'
    | 'playlists'
    | 'artists'
    | 'albums'
    | 'tracks'
    | 'genres';

export const SEARCH_FILTERS: { key: SearchFilter; label: string }[] = [
    { key: 'all',       label: 'Всі' },
    { key: 'playlists', label: 'Плейлісти' },
    { key: 'artists',   label: 'Виконавці' },
    { key: 'albums',    label: 'Альбоми' },
    { key: 'tracks',    label: 'Треки' },
    { key: 'genres',    label: 'Жанри і настрої' },
];

export interface SearchResults {
    tracks:    SearchTrack[];
    artists:   SearchArtist[];
    albums:    SearchAlbum[];
    playlists: SearchPlaylist[];
    genres:    SearchGenre[];
}

export interface SearchTrack {
    id: string;
    title: string;
    artistNames: string[];
    artistId?: string;
    albumId?: string;
    albumTitle?: string | null;
    durationMs?: number | null;
    coverUrl?: string | null;
}

export interface SearchArtist {
    id: string;
    name: string;
    monthlyListeners?: number;
    avatarUrl?: string | null;
}

export interface SearchAlbum {
    id: string;
    title: string;
    artistName: string;
    artistId?: string;
    tracksCount?: number;
    coverUrl?: string | null;
}

export interface SearchPlaylist {
    id: string;
    name: string;
    authorName?: string;
    tracksCount?: number;
    coverUrl?: string | null;
}

export interface SearchGenre {
    id: string;
    name: string;
    coverUrl?: string | null;
    color?: string | null;
}