export * from './generated/artist/endpoints/studio-artist-profile';
export * from './generated/artist/endpoints/studio-artist-tracks';
export * from './generated/artist/endpoints/studio-artist-albums';
export * from './generated/artist/endpoints/studio-artist-analytics';
export * from './generated/artist/endpoints/studio-artist-finance';
export * from './generated/artist/endpoints/studio-artist-team';
export * from './generated/artist/endpoints/studio-artist-payments';
export * from './generated/artist/endpoints/studio-artist-playlists';
export * from './generated/artist/endpoints/studio-artist-marketing';

// Моделі артиста
export * from './generated/artist/models';

// Спільний налаштовувач інстансу
export { configureApiClient, initCsrfToken, customInstance } from './mutator';
