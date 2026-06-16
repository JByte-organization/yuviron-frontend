import type {
    StudioAlbumListItemDto,
    StudioTrackListItemDto,
} from '@repo/api/artist.ts';

export type StudioTrackListItemFlex = StudioTrackListItemDto & {
    albumId?: string;
    albumTitle?: string | null;
    albumPosition?: number;
    artistNames?: string[] | null;
};

export type StudioAlbumListItemFlex = StudioAlbumListItemDto & {
    tracksCount?: number;
};
