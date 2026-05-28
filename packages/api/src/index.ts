// Адмінка
export * from './generated/admin/endpoints/admin-tracks';
export * from './generated/admin/endpoints/admin-users';
export * from './generated/admin/endpoints/admin-artists';
export * from './generated/admin/endpoints/admin-banners';
export * from './generated/admin/endpoints/admin-roles';
export * from './generated/admin/endpoints/admin-genres';
export * from './generated/admin/endpoints/admin-moods';
export * from './generated/admin/endpoints/admin-albums';
export * from './generated/admin/endpoints/admin-dashboard';
export * from './generated/admin/endpoints/admin-playlists';


// Клієнт
export * from './generated/client/endpoints/files';
export * from './generated/client/endpoints/auth';
export * from './generated/client/endpoints/home';
export * from './generated/client/endpoints/genres';
export * from './generated/client/endpoints/moods';
export * from './generated/client/endpoints/tracks';
export * from './generated/client/endpoints/artists';
export * from './generated/client/endpoints/me';
export * from './generated/client/endpoints/me-playlists';


export * from './generated/client/endpoints/artist-profiles';

export * from './generated/admin/models';

export * from './generated/client/models/homeBannerDto';
export * from './generated/client/models/genreItemDto';
export * from './generated/client/models/topTrackDto';
export * from './generated/client/models/topArtistDto';
export * from './generated/client/models/moodItemDto';
export * from './generated/client/models/newReleaseDto';
export * from './generated/client/models/followedArtistDto';
export * from './generated/client/models/userPlaylistDto';
export * from './generated/client/models/recentlyPlayedTrackDto';


export { configureApiClient } from './mutator';