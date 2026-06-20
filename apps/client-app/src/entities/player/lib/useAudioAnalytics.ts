'use client';

import { useRef, useEffect, useCallback } from 'react';

export interface AudioChunk {
    startSecond: number;
    endSecond: number;
}

export const useAudioAnalytics = (audioRef: React.RefObject<HTMLAudioElement | null>) => {
    const chunks = useRef<AudioChunk[]>([]);
    const currentChunkStart = useRef<number | null>(null);

    const closeCurrentChunk = useCallback(() => {
        if (currentChunkStart.current !== null && audioRef.current) {
            const start = Math.floor(currentChunkStart.current);
            const end = Math.floor(audioRef.current.currentTime);

            // Игнорируем микро-клики (меньше 1 секунды)
            if (end > start) {
                chunks.current.push({ startSecond: start, endSecond: end });
            }
            currentChunkStart.current = null;
        }
    }, [audioRef]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handlePlay = () => {
            currentChunkStart.current = audio.currentTime;
        };
        const handlePause = () => { closeCurrentChunk(); };
        const handleSeeking = () => { closeCurrentChunk(); };
        const handleSeeked = () => {
            if (!audio.paused) {
                currentChunkStart.current = audio.currentTime;
            }
        };
        const handleEnded = () => { closeCurrentChunk(); };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('seeking', handleSeeking);
        audio.addEventListener('seeked', handleSeeked);
        audio.addEventListener('ended', handleEnded);

        return () => {
            closeCurrentChunk();
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('seeking', handleSeeking);
            audio.removeEventListener('seeked', handleSeeked);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audioRef, closeCurrentChunk]);

    const getChunks = useCallback(() => chunks.current, []);
    const clearChunks = useCallback(() => { chunks.current = []; }, []);

    return {
        getChunks,
        clearChunks,
        closeCurrentChunk
    };
};