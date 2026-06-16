'use client';

import { useCurrentArtist } from './currentArtist';
import { can as canFn, lockTitle as lockTitleFn, roleLabel, type ArtistAction } from './permissions';

export const useArtistPermissions = () => {
    const { role } = useCurrentArtist();
    return {
        role,
        roleLabel: roleLabel(role),
        lockTitle: lockTitleFn(role),
        can: (action: ArtistAction): boolean => canFn(role, action),
    };
};
