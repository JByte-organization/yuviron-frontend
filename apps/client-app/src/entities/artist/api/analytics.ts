import { useQuery } from '@tanstack/react-query';
import { customInstance } from '@repo/api/artist.ts';

/**
 * Ручний API-шар аналітики Artist Studio.
 *
 * Цих ендпоінтів НЕМАЄ у /swagger/artist (дока «Інтеграція аналітичного модуля
 * Studio Artist», 2026-06-07), тому Orval їх не генерує. Типи й шляхи звірені
 * з докою вручну; коли бек додасть групу у свагер — замінити на згенеровані
 * хуки з @repo/api/artist.ts і видалити цей файл.
 *
 * Дані з ClickHouse, кешуються на беку — відповіді швидкі, але на перший
 * рендер усе одно показуємо скелетони (рекомендація з доки).
 */


export interface TrackRetentionPointDto {
    /** Секунда треку */
    second: number;
    /** Абсолютна кількість прослуховувань, що дійшли до цієї секунди */
    absolutePlays: number;
    /** % слухачів, що дослухали до цієї секунди (0–100, 2 знаки) */
    retentionPercent: number;
}

export interface PlaysOverTimePointDto {
    /** ISO-8601 / yyyy-MM-dd */
    date: string;
    totalPlays: number;
    uniqueListeners: number;
}

export interface AudienceCountryDto {
    countryCode: string;
    listeners: number;
}

export interface AudienceDeviceDto {
    deviceType: string;
    plays: number;
}

export interface ArtistAudienceDashboardDto {
    topCountries: AudienceCountryDto[];
    devices: AudienceDeviceDto[];
}


const BASE = '/api/studio-artist';

const qs = (params: Record<string, string | number | undefined>): string => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) search.append(key, String(value));
    });
    const str = search.toString();
    return str ? `?${str}` : '';
};

export const getTrackRetention = (trackId: string, artistId: string) =>
    customInstance<TrackRetentionPointDto[]>(
        `${BASE}/tracks/${trackId}/analytics/retention${qs({ artistId })}`,
        { method: 'GET' },
    );

export const getTrackPlaysOverTime = (trackId: string, artistId: string, days = 30) =>
    customInstance<PlaysOverTimePointDto[]>(
        `${BASE}/tracks/${trackId}/analytics/plays-over-time${qs({ artistId, days })}`,
        { method: 'GET' },
    );

export const getArtistAudience = (artistId: string, days = 30) =>
    customInstance<ArtistAudienceDashboardDto>(
        `${BASE}/${artistId}/audience${qs({ days })}`,
        { method: 'GET' },
    );

export const getArtistPlaysOverTime = (artistId: string, days = 30) =>
    customInstance<PlaysOverTimePointDto[]>(
        `${BASE}/${artistId}/plays-over-time${qs({ days })}`,
        { method: 'GET' },
    );


export const useTrackRetention = (trackId: string | undefined, artistId: string | null) =>
    useQuery({
        queryKey: ['studio-artist', 'track-retention', trackId, artistId],
        queryFn: () => getTrackRetention(trackId!, artistId!),
        enabled: !!trackId && !!artistId,
    });

export const useTrackPlaysOverTime = (
    trackId: string | undefined,
    artistId: string | null,
    days = 30,
) =>
    useQuery({
        queryKey: ['studio-artist', 'track-plays-over-time', trackId, artistId, days],
        queryFn: () => getTrackPlaysOverTime(trackId!, artistId!, days),
        enabled: !!trackId && !!artistId,
    });

export const useArtistAudience = (artistId: string | null, days = 30) =>
    useQuery({
        queryKey: ['studio-artist', 'audience', artistId, days],
        queryFn: () => getArtistAudience(artistId!, days),
        enabled: !!artistId,
    });

export const useArtistPlaysOverTime = (artistId: string | null, days = 30) =>
    useQuery({
        queryKey: ['studio-artist', 'plays-over-time', artistId, days],
        queryFn: () => getArtistPlaysOverTime(artistId!, days),
        enabled: !!artistId,
    });
