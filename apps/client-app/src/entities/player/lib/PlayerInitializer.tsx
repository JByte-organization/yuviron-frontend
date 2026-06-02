'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../model/playerStore';
import { playerAudioRef, playerAdAudioRef } from '../lib/playerRefs';
import { usePlayer } from '../lib/usePlayer';

export const PlayerInitializer = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const adAudioRef = useRef<HTMLAudioElement | null>(null);
    const { next } = usePlayer(); // Беремо метод перемикання з хука

    const setDuration = usePlayerStore(s => s.setDuration);
    const setCurrentTime = usePlayerStore(s => s.setCurrentTime);
    const setStatus = usePlayerStore(s => s.setStatus);
    const currentTrack = usePlayerStore(s => s.currentTrack);

    useEffect(() => {
        // Зберігаємо нативні елементи в твій глобальний Singleton Ref
        playerAudioRef.current = audioRef.current;
        playerAdAudioRef.current = adAudioRef.current;

        const audio = audioRef.current;
        if (!audio) return;

        // 1. СИНХРОНІЗАЦІЯ ЧАСУ ТА ТРИВАЛОСТІ З ZUSTAND
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleDurationChange = () => setDuration(audio.duration || 0);
        const handleEnded = () => { void next(); };

        // ФІКС ДЛЯ SAFARI / IOS (Повноцінний Silent Retry)
        const handleNativeError = async () => {
            const audio = playerAudioRef.current;
            if (!audio || !audio.error || !currentTrack) return;

            // Код 4 (MEDIA_ERR_SRC_NOT_SUPPORTED) або 2 (NETWORK_ERROR) вилітають при протуханні Signed URL
            const isAuthError = audio.error.code === 4 || audio.error.code === 2;

            if (isAuthError) {
                console.warn('[Player Safari] Token expired or IP changed, refreshing stream...');

                try {
                    const currentTime = audio.currentTime; // Запам'ятовуємо секунду

                    // Смикаємо ендпоінт за свіжим Signed URL
                    const res = await fetch(`/api/tracks/${currentTrack.id}/play`);
                    const payload = await res.json();

                    // Витягуємо сирий URL (враховуючи пласку або вкладену структуру)
                    const rawUrl = payload?.data?.audioUrl ?? payload?.audioUrl;

                    if (rawUrl) {
                        // Формуємо абсолютний шлях (наш хелпер з урахуванням домену бекенду)
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dev-api.yuviron.com/api';
                        const origin = apiUrl.replace(/\/api.*$/, '');
                        const newAudioUrl = rawUrl.startsWith('http') ? rawUrl : `${origin}${rawUrl}`;

                        // Перезапускаємо нативний потік Safari
                        audio.src = newAudioUrl;
                        audio.load();

                        // Повертаємо слухач на ту саму секунду після завантаження маніфесту
                        audio.onloadedmetadata = () => {
                            audio.currentTime = currentTime;
                            void audio.play();
                            usePlayerStore.getState().setAudioUrl(newAudioUrl);
                            audio.onloadedmetadata = null; // Чистимо за собою
                        };
                    }
                } catch (err) {
                    console.error('[Player Safari] Silent retry failed:', err);
                    setStatus('idle');
                }
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('durationchange', handleDurationChange);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleNativeError);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('durationchange', handleDurationChange);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleNativeError);
        };
    }, [currentTrack, next, setCurrentTime, setDuration]);

    return (
        <>
            <audio ref={audioRef} preload="metadata" />
            <audio ref={adAudioRef} preload="none" />
        </>
    );
};