// Матриця прав ролей команди артиста (ArtistTeamRole: Owner/Manager/Editor/Viewer).
// Авторитет — бекенд (403 на заборонену дію); це лише UX-шар: ховаємо/блокуємо
// кнопки, які все одно дали б 403. Джерело правил — reference_artist_role_permissions.
//
//  Функція                         Owner  Manager  Editor  Viewer
//  deleteAccount (видалення)         ✓       ✗        ✗       ✗
//  manageTeam (команда)              ✓       ✓        ✗       ✗
//  finance (баланс/виплати)          ✓       ✓        ✗       ✗
//  tracks (треки/альбоми upload/del) ✓       ✓        ✓       ✗
//  banners (замовлення реклами)      ✓       ✓        ✗       ✗
//  editProfile (редагування профілю) ✓       ✓        ✓       ✗
//  socialLinks (соцмережі)           ✓       ✓        ✓       ✗
//  viewStats (перегляд статистики)   ✓       ✓        ✓       ✓

export type ArtistAction =
    | 'deleteAccount'
    | 'manageTeam'
    | 'finance'
    | 'tracks'
    | 'banners'
    | 'editProfile'
    | 'socialLinks'
    | 'viewStats';

const ALL: ArtistAction[] = [
    'deleteAccount', 'manageTeam', 'finance', 'tracks',
    'banners', 'editProfile', 'socialLinks', 'viewStats',
];

const MATRIX: Record<string, ArtistAction[]> = {
    Owner:   ALL,
    Manager: ['manageTeam', 'finance', 'tracks', 'banners', 'editProfile', 'socialLinks', 'viewStats'],
    Editor:  ['tracks', 'editProfile', 'socialLinks', 'viewStats'],
    Viewer:  ['viewStats'],
};

const ROLE_LABEL: Record<string, string> = {
    Owner:   'Власник',
    Manager: 'Менеджер',
    Editor:  'Редактор',
    Viewer:  'Перегляд',
};

/**
 * Чи дозволена дія для ролі. Невідома/порожня роль (null/Unknown/не з матриці) —
 * НЕ обмежуємо: роль у claim іноді відсутня в власників, а бек все одно перевіряє.
 */
export const can = (role: string | null | undefined, action: ArtistAction): boolean => {
    if (!role) return true;
    const allowed = MATRIX[role];
    if (!allowed) return true;
    return allowed.includes(action);
};

export const roleLabel = (role: string | null | undefined): string =>
    (role && ROLE_LABEL[role]) || role || 'Учасник';

/** Текст тултипа для заблокованої дії (підставляє роль). */
export const lockTitle = (role: string | null | undefined): string =>
    `Ваша роль «${roleLabel(role)}» не дозволяє виконати цю дію`;
