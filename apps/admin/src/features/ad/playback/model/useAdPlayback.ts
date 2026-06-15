'use client';

import { useState, useRef, useEffect } from 'react';
import { customInstance } from '@repo/api/admin.ts';

export const useAdPlayback = () => {
    const [playingAdId, setPlayingAdId] = useState<string | null>(null);
    const [loadingAdId, setLoadingAdId] = useState<string | null>(null); // Лоадер для конкретного рядка реклами
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handlePlayToggle = async (adId: string) => {
        // Якщо клікнули на ту саму рекламу, що вже грає — ставимо на паузу
        if (playingAdId === adId) {
            audioRef.current?.pause();
            setPlayingAdId(null);
            return;
        }

        // Якщо вже грає якась інша реклама — зупиняємо її
        if (audioRef.current) {
            audioRef.current.pause();
        }

        setLoadingAdId(adId);

        try {
            // 🚨 Отримуємо тимчасове підписане посилання для реклами за аналогією з треками
            const res = await customInstance<{ previewUrl: string }>(
                `/api/admin/ads/${adId}/preview-url`,
                { method: 'GET' }
            );

            const previewUrl = (res as { data?: { previewUrl: string } })?.data?.previewUrl
                ?? (res as { previewUrl: string }).previewUrl;

            if (!previewUrl) {
                alert('Failed to generate stream URL for this advertisement campaign.');
                setLoadingAdId(null);
                return;
            }

            const apiOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') ?? 'https://dev-api.yuviron.com';
            audioRef.current = new Audio(`${apiOrigin}${previewUrl}`);
            await audioRef.current.play();

            setPlayingAdId(adId);
        } catch (err) {
            console.error('Failed to resolve advertisement audio stream:', err);
            alert('Error fetching audio source from storage provider.');
        } finally {
            setLoadingAdId(null);
        }

        if (audioRef.current) {
            audioRef.current.onended = () => {
                setPlayingAdId(null);
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
        playingAdId,
        loadingAdId,
        handlePlayToggle,
    };
};