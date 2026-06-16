
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

export const can = (role: string | null | undefined, action: ArtistAction): boolean => {
    if (!role) return true;
    const allowed = MATRIX[role];
    if (!allowed) return true;
    return allowed.includes(action);
};

export const roleLabel = (role: string | null | undefined): string =>
    (role && ROLE_LABEL[role]) || role || 'Учасник';

export const lockTitle = (role: string | null | undefined): string =>
    `Ваша роль «${roleLabel(role)}» не дозволяє виконати цю дію`;
