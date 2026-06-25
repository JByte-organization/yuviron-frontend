'use client';

import React, { useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import {
    useGetApiTracksId,
    getGetApiTracksIdQueryKey,
    usePostApiMeFavoritesTracks,
    usePostApiMarketingSmartlinks,
    type TrackDetailsDto
} from '@repo/api/client';
import { getImageUrl } from '@/shared/lib/getImageUrl';

import { TrackPageHeader } from './ui/TrackPageHeader';
import { AddToPlaylistModal } from '@/features/playlist/add/ui/AddToPlaylistModal';
import { ReportTrackModal } from '@/features/complaint/ui/ReportTrackModal';
import { TrackRecommendationsSection } from './ui/TrackRecommendationsSection';
import { ArtistTopTracksSection } from './ui/ArtistTopTracksSection';
import { ArtistAlbumsSection } from './ui/ArtistAlbumsSection';

interface TrackPageProps {
    trackId: string;
}

interface OrvalResponseWrapper<T> {
    data?: T;
}

export const TrackPage = ({ trackId }: TrackPageProps) => {
    const [showAddPlaylist, setShowAddPlaylist] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [successToast, setSuccessToast] = useState<string | null>(null);

    const { data: trackRaw, isLoading } = useGetApiTracksId(trackId, {
        query: {
            enabled: !!trackId,
            queryKey: getGetApiTracksIdQueryKey(trackId),
        }
    });

    const { mutate: toggleFavorite } = usePostApiMeFavoritesTracks();
    const { mutateAsync: generateSmartLink } = usePostApiMarketingSmartlinks();

    const track = useMemo<TrackDetailsDto | undefined>(() => {
        if (!trackRaw) return undefined;
        const response = trackRaw as OrvalResponseWrapper<TrackDetailsDto>;
        return response.data ?? (trackRaw as TrackDetailsDto);
    }, [trackRaw]);

    const mainArtist = track?.artists?.[0];
    const artistId = mainArtist?.id ?? '';
    const artistName = mainArtist?.name ?? 'Невідомий виконавець';

    const coverSrc = useMemo(() => {
        if (!track?.coverUrl) return null;
        return getImageUrl(track.coverUrl);
    }, [track]);

    const triggerToast = (msg: string) => {
        setSuccessToast(msg);
        setTimeout(() => setSuccessToast(null), 4000);
    };

    // ─── ОБРОБНИК ГЕНЕРАЦІЇ ПРАВИЛЬНОГО СМАРТ-ПОСИЛАННЯ ВІД БЕКЕНДУ ───
    const handleShareTrack = async () => {
        try {
            // Відправляємо CreateSmartLinkCommand з типом Track згідно з контрактом
            const response = await generateSmartLink({
                data: {
                    entityType: 'Track',
                    entityId: trackId
                }
            });

            const resData = (response as any)?.data || response;
            // Витягуємо згенерований URL від бекенду (наприклад, https://dev.yuviron.com/sl/c51a1977)
            const backendUrl = resData?.url || resData?.code;

            if (backendUrl) {
                await navigator.clipboard.writeText(backendUrl);
                triggerToast("Посилання скопійовано!");
            } else {
                console.error('[Share Error] Порожня відповідь від сутності SmartLink структури:', response);
                // Фолбек на випадок відсутності поля у відповіді
                await navigator.clipboard.writeText(`${window.location.origin}/track/${trackId}`);
                triggerToast("Посилання скопійовано!");
            }
        } catch (error) {
            console.error('[Share Error] Не вдалося згенерувати смарт-посилання від беку:', error);
            // Резервний варіант, щоб інтерфейс не вмирав, якщо бекенд маркетингу видасть 500
            try {
                await navigator.clipboard.writeText(`${window.location.origin}/track/${trackId}`);
                triggerToast("Посилання скопійовано!");
            } catch (e) {
                console.error(e);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center bg-neutral-950" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-light" role="status" />
            </div>
        );
    }

    if (!track) return notFound();

    return (
        <div className="track-page text-white">
            <TrackPageHeader
                trackId={track.id ?? ''}
                title={track.title ?? 'Без назви'}
                artistName={artistName}
                artistId={artistId}
                albumTitle={track.albumTitle ?? 'Сінгл'}
                year="—"
                durationMs={track.durationMs ?? 0}
                coverUrl={coverSrc}
                onPlay={() => console.log('play')}
                onLike={() => toggleFavorite({ data: { trackId } as any })}
                onAddToPlaylist={() => setShowAddPlaylist(true)}
                onShare={handleShareTrack}
                onReport={() => setShowReport(true)}
            />

            <TrackRecommendationsSection trackId={trackId} />

            {artistId && <ArtistTopTracksSection artistId={artistId} artistName={artistName} />}
            {artistId && <ArtistAlbumsSection artistId={artistId} artistName={artistName} />}

            {showAddPlaylist && (
                <AddToPlaylistModal
                    isOpen={showAddPlaylist}
                    onClose={() => setShowAddPlaylist(false)}
                    trackId={track.id ?? ''}
                    trackTitle={track.title ?? ''}
                />
            )}

            {showReport && (
                <ReportTrackModal
                    isOpen={showReport}
                    onClose={() => setShowReport(false)}
                    trackId={track.id ?? ''}
                    trackTitle={track.title ?? ''}
                    onSuccess={() => triggerToast("Скарга на аудіозапис успішно зареєстрована.")}
                />
            )}

            {successToast && (
                <div className="position-fixed bottom-0 end-0 m-4 p-3 rounded-3 shadow-lg border border-success bg-dark text-success" style={{ zIndex: 1100, fontSize: '13px' }}>
                    <span className="fw-semibold">✓ {successToast}</span>
                </div>
            )}
        </div>
    );
};