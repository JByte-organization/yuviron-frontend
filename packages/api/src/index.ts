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
export * from './generated/client/endpoints/artist-profiles';

// модели
// admin/models экспортируется целиком — это исторически используется в admin-app.
// client/models не реэкспортируется глобально, потому что многие имена пересекаются
// с admin (Gender, ProblemDetails, ArtistRole и т.п.) — это разные сгенерированные
// типы и `export *` дал бы TS2308 ambiguous re-export.
// Импортируй конкретные client-модели по пути:
//   import { Gender } from '@repo/api/generated/client/models/gender';
export * from './generated/admin/models';


export { configureApiClient, customInstance } from './mutator';