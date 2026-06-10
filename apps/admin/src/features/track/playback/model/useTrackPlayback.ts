'use client';

import { useState, useRef, useEffect } from 'react';
// Імпортуємо пряму функцію запиту деталей згенеровану Orval
import { getApiAdminTracksId, type TrackDetailsDto } from '@repo/api/admin.ts';
import { getImageUrl } from '@/shared/lib/getImageUrl';

export const useTrackPlayback = () => {
    const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
    const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null); // Стан завантаження для конкретного рядка
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handlePlayToggle = async (trackId: string) => {
        // Якщо клікнули на той самий трек, що вже грає — ставимо на паузу
        if (playingTrackId === trackId) {
            audioRef.current?.pause();
            setPlayingTrackId(null);
            return;
        }

        // Якщо вже грає якийсь інший трек — зупиняємо його
        if (audioRef.current) {
            audioRef.current.pause();
        }

        setLoadingTrackId(trackId);

        try {
            // 🚨 ЛАЗІ-ЛОАДИНГ: Запитуємо повні деталі треку для отримання аудіо-ключа
            const res = await getApiAdminTracksId(trackId);
            const details = (res as { data?: TrackDetailsDto })?.data ?? (res as TrackDetailsDto);

            // Пріоритетно беремо progressive mp3 ключ або hls плейлист
            const audioKey = details.audioStorageKey || details.hlsPlaylistUrl;

            if (!audioKey) {
                alert('Audio asset source key is missing for this track entry.');
                setLoadingTrackId(null);
                return;
            }

            const absoluteUrl = getImageUrl(audioKey);
            if (!absoluteUrl) {
                setLoadingTrackId(null);
                return;
            }

            // Запускаємо аудіо-потік браузера
            audioRef.current = new Audio(absoluteUrl);
            await audioRef.current.play();

            setPlayingTrackId(trackId);
        } catch (err) {
            console.error('Failed to resolve track audio stream:', err);
            alert('Error fetching audio source from storage provider.');
        } finally {
            setLoadingTrackId(null);
        }

        if (audioRef.current) {
            audioRef.current.onended = () => {
                setPlayingTrackId(null);
            };
        }
    };

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    return {
        playingTrackId,
        loadingTrackId,
        handlePlayToggle,
    };
};