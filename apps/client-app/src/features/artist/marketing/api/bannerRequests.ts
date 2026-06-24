// Ручний шар для banner-request ендпоінтів. Запінений artist-swagger старший за
// живий бек: GET .../active і POST .../{id}/pay взагалі НЕ згенеровані, а в
// згенерованому SubmitBannerRequestCommand НЕМА durationDays/targetCountries/
// targetGenres (бек їх уже приймає). Тому всі три ходять тут напряму через
// customInstance з повними типами. Коли пін оновлять — прибрати, перейти на хуки.
import { customInstance } from '@repo/api/artist.ts';

export type BannerRequestStatus =
    | 'AwaitingPayment'
    | 'Pending'
    | 'Approved'
    | 'Rejected';

export interface ActiveBannerRequestDto {
    id?: string;
    artistId?: string;
    albumId?: string | null;
    title?: string | null;
    bannerUrl?: string | null;
    status?: BannerRequestStatus;
    adminNotes?: string | null;
    isPaid?: boolean;
    durationDays?: number;
    targetCountries?: string | null;
    targetGenres?: string | null;
    endsAtUtc?: string | null;
    createdAt?: string;
}

export interface PayBannerRequestDto {
    artistId: string;
    successUrl?: string | null;
    cancelUrl?: string | null;
}

export interface PayBannerResponse {
    checkoutUrl?: string | null;
}

// Повний live-тип команди (згенерований — застарілий, без durationDays/таргетингу).
export interface SubmitBannerRequestBody {
    artistId: string;
    albumId: string;
    title?: string | null;
    bannerFileId: string;
    durationDays: number;
    targetCountries?: string | null;
    targetGenres?: string | null;
    successUrl?: string | null;
    cancelUrl?: string | null;
    requiredPermission?: string;
}

export interface SubmitBannerResponse {
    requestId?: string;
    checkoutUrl?: string | null;
}

export const submitBannerRequest = (
    body: SubmitBannerRequestBody,
): Promise<SubmitBannerResponse> =>
    customInstance<SubmitBannerResponse>(
        `/api/studio-artist/marketing/banner-requests`,
        { method: 'POST', body: JSON.stringify(body) },
    );

// 204 (немає активної заявки) → customInstance віддає {} → нормалізуємо в null.
export const getActiveBannerRequest = async (
    artistId: string,
): Promise<ActiveBannerRequestDto | null> => {
    const res = await customInstance<ActiveBannerRequestDto>(
        `/api/studio-artist/marketing/banner-requests/active?artistId=${encodeURIComponent(artistId)}`,
        { method: 'GET' },
    );
    return res && (res as ActiveBannerRequestDto).id ? res : null;
};

export const payBannerRequest = (
    requestId: string,
    body: PayBannerRequestDto,
): Promise<PayBannerResponse> =>
    customInstance<PayBannerResponse>(
        `/api/studio-artist/marketing/banner-requests/${requestId}/pay`,
        { method: 'POST', body: JSON.stringify(body) },
    );
