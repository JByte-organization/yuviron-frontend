'use client';

import { useState } from 'react';
import {
    ClaimRole,
    usePostApiArtistProfilesIdClaim,
    usePostApiFilesUpload,
} from '@repo/api/client.ts';
import { extractApiError, extractFileId } from './helpers';

export type ClaimStatus = 'idle' | 'submitting' | 'submitted';

export interface ClaimFields {
    officialEmail: string;
    links: string;
    message: string;
    proof: File | null;
}

export const useClaimArtistProfile = () => {
    const [status, setStatus] = useState<ClaimStatus>('idle');
    const [error, setError] = useState<string | null>(null);

    const { mutateAsync: uploadFile } = usePostApiFilesUpload();
    const { mutateAsync: claim } = usePostApiArtistProfilesIdClaim();

    const submit = async (artistId: string, fields: ClaimFields) => {
        setError(null);
        setStatus('submitting');
        try {
            let proofFileId: string | null = null;
            if (fields.proof) {
                proofFileId = extractFileId(await uploadFile({ data: { file: fields.proof } }));
            }
            await claim({
                id: artistId,
                data: {
                    claimedRole: ClaimRole.Artist,
                    officialEmail: fields.officialEmail.trim() || null,
                    links: fields.links.trim() || null,
                    message: fields.message.trim() || null,
                    proofFileId,
                },
            });
            setStatus('submitted');
        } catch (err) {
            setStatus('idle');
            setError(extractApiError(err, 'Не вдалося надіслати заявку. Спробуйте ще раз.'));
        }
    };

    return { status, error, submit, isSubmitting: status === 'submitting' };
};
