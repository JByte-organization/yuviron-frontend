// Ендпоінти Адмінки
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
export * from './generated/admin/endpoints/admin-auth';
export * from './generated/admin/endpoints/admin-ads';

// МОДЕЛІ АДМІНКИ — аналогічно, однією строкою
export * from './generated/admin/models';

export { configureApiClient } from './mutator';