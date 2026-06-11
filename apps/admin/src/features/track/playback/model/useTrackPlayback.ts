'use client';

import { useState, useRef, useEffect } from 'react';
import { customInstance } from '@repo/api/admin.ts';

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
            const res = await customInstance<{ previewUrl: string }>(
                `/api/admin/tracks/${trackId}/preview-url`,
                { method: 'GET' }
            );
            const previewUrl = (res as { data?: { previewUrl: string } })?.data?.previewUrl
                ?? (res as { previewUrl: string }).previewUrl;

            if (!previewUrl) {
                alert('Failed to generate preview URL for this track.');
                setLoadingTrackId(null);
                return;
            }

            // Signed URL carries the auth token in query params — no headers needed
            const apiOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ?? 'https://dev-api.yuviron.com';
            audioRef.current = new Audio(`${apiOrigin}${previewUrl}`);
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