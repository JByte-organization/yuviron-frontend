import { useQuery } from '@tanstack/react-query';
import { customInstance } from '@repo/api/artist.ts';



export interface TrackRetentionPointDto {
    second: number;
    absolutePlays: number;
    retentionPercent: number;
}

export interface PlaysOverTimePointDto {
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
