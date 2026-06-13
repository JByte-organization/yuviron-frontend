'use client';

import { useState, useRef, useEffect } from 'react';
import { getImageUrl } from '@/shared/lib/getImageUrl';

export const useAdPlayback = () => {
    const [playingAdId, setPlayingAdId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handlePlayToggle = (adId: string, audioUrl: string | null | undefined) => {
        if (!audioUrl) return;

        const absoluteUrl = getImageUrl(audioUrl);

        if (!absoluteUrl) return;

        audioRef.current = new Audio(absoluteUrl);
        audioRef.current.play().catch((err) => {
            console.error('Audio playback interaction interrupted:', err);
            setPlayingAdId(null);
        });

        // Якщо клікнули на ту саму рекламу, що вже грає — ставимо на паузу
        if (playingAdId === adId) {
            audioRef.current?.pause();
            setPlayingAdId(null);
            return;
        }

        // Якщо грає інша реклама — зупиняємо її перед стартом нової
        if (audioRef.current) {
            audioRef.current.pause();
        }

        // Ініціалізуємо новий аудіо-потік
        audioRef.current = new Audio(absoluteUrl);
        audioRef.current.play().catch((err) => {
            console.error('Audio playback interaction interrupted:', err);
            setPlayingAdId(null);
        });

        setPlayingAdId(adId);

        // Коли ролик дограв до кінця — скидаємо стейт
        audioRef.current.onended = () => {
            setPlayingAdId(null);
        };
    };

    // Очищення потоків при виході зі сторінки (щоб музика не залишалася в фоні)
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
        handlePlayToggle,
    };
};