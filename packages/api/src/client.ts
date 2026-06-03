// Ендпоінти Клієнта (твої теги з Orval)
export * from './generated/client/endpoints/files';
export * from './generated/client/endpoints/auth';
export * from './generated/client/endpoints/home';
export * from './generated/client/endpoints/genres';
export * from './generated/client/endpoints/moods';
export * from './generated/client/endpoints/tracks';
export * from './generated/client/endpoints/artists';
export * from './generated/client/endpoints/artist-profiles';
export * from './generated/client/endpoints/search';
export * from './generated/client/endpoints/me';
export * from './generated/client/endpoints/me-playlists';
export * from './generated/client/endpoints/playlists';
export * from './generated/client/endpoints/notifications';
export * from './generated/client/endpoints/users';
export * from './generated/client/endpoints/albums';
export { postApiAnalyticsPlayStart, postApiAnalyticsPlayCommit } from './generated/client/endpoints/analytics';

// МОДЕЛІ КЛІЄНТА — тепер імпортуємо ВСІ однією строкою без конфліктів!
export * from './generated/client/models';

// Спільний налаштовувач інстансу
export { configureApiClient, initCsrfToken, customInstance } from './mutator';