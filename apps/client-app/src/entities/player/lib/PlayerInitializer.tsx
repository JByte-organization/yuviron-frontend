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

        // 2. ФІКС ДЛЯ SAFARI / IOS (Silent Retry на випадок помилки мережі/токену)
        const handleNativeError = async () => {
            if (!audio.error || !currentTrack) return;

            // Код 4 або 2 зазвичай свідчить про проблеми з мережею або протухлим медіа-джерелом (401/403)
            console.warn('[Player] Native audio error caught (Safari fallback):', audio.error.code);

            // Тут можна викликати твою функцію refreshStreamUrl(currentTrack.id)
            // і перезапустити src, як ми робили в Hls.js обробнику
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