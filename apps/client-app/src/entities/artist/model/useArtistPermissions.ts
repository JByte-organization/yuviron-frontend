'use client';

import { useCurrentArtist } from './currentArtist';
import { can as canFn, lockTitle as lockTitleFn, roleLabel, type ArtistAction } from './permissions';

/**
 * Права поточного кабінету артиста за матрицею ролей. Заміняє грубий `canManage`
 * (role !== 'Viewer') на пер-екшн перевірку. Використання:
 *
 *   const { can, lockTitle } = useArtistPermissions();
 *   <button disabled={!can('tracks')} title={!can('tracks') ? lockTitle : undefined}>…</button>
 */
export const useArtistPermissions = () => {
    const { role } = useCurrentArtist();
    return {
        role,
        roleLabel: roleLabel(role),
        /** Текст тултипа для заблокованої дії (підставляє роль). */
        lockTitle: lockTitleFn(role),
        can: (action: ArtistAction): boolean => canFn(role, action),
    };
};
