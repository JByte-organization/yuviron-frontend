'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../model/playerStore';
import { playerAudioRef, playerAdAudioRef, audioAnalyticsRef } from '../lib/playerRefs'; //
import { usePlayer } from '../lib/usePlayer';
import { useAudioAnalytics } from '../lib/useAudioAnalytics';

import { getApiTracksIdPlay, type TrackStreamUrlResponse } from '@repo/api/client';

export const PlayerInitializer = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const adAudioRef = useRef<HTMLAudioElement | null>(null);
    const { next } = usePlayer();

    const setDuration = usePlayerStore(s => s.setDuration);
    const setCurrentTime = usePlayerStore(s => s.setCurrentTime);
    const setStatus = usePlayerStore(s => s.setStatus);
    const currentTrack = usePlayerStore(s => s.currentTrack);

    const analytics = useAudioAnalytics(audioRef);

    useEffect(() => {
        playerAudioRef.current = audioRef.current;
        playerAdAudioRef.current = adAudioRef.current;

        audioAnalyticsRef.getChunks = analytics.getChunks;
        audioAnalyticsRef.clearChunks = analytics.clearChunks;
        audioAnalyticsRef.closeCurrentChunk = analytics.closeCurrentChunk;

        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleDurationChange = () => setDuration(audio.duration || 0);
        const handleEnded = () => { void next(); };

        const handleNativeError = async () => {
            const currentStatus = usePlayerStore.getState().status;
            if (!audio.error || !currentTrack || currentStatus === 'idle') return;

            if (audio.duration && (audio.duration - audio.currentTime < 2)) {
                console.log('[Player Safari] Конец трека, переключаем...');
                void next();
                return;
            }

            const isAuthError = audio.error.code === 4 || audio.error.code === 2;

            if (isAuthError) {
                console.warn('[Player Safari] Токен протух или изменился IP, обновляем поток...');
                try {
                    const currentTime = audio.currentTime;
                    const res = await getApiTracksIdPlay(currentTrack.id);
                    const data = res as unknown as { data?: TrackStreamUrlResponse } | TrackStreamUrlResponse;
                    const payload: TrackStreamUrlResponse = 'data' in data && data.data ? data.data : (data as TrackStreamUrlResponse);

                    const rawUrl = payload.audioUrl ?? null;

                    if (rawUrl) {
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dev-api.yuviron.com/api';
                        const origin = apiUrl.replace(/\/api.*$/, '');
                        const newAudioUrl = rawUrl.startsWith('http') ? rawUrl : `${origin}${rawUrl}`;

                        audio.src = newAudioUrl;
                        audio.load();

                        audio.onloadedmetadata = () => {
                            audio.currentTime = currentTime;
                            void audio.play();
                            usePlayerStore.getState().setAudioUrl(newAudioUrl);
                            audio.onloadedmetadata = null;
                        };
                    }
                } catch (err) {
                    console.error('[Player Safari] Нативный ретрай завершился ошибкой:', err);
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
    }, [currentTrack, next, setCurrentTime, setDuration, setStatus, analytics]);

    return (
        <>
            <audio ref={audioRef} preload="metadata" />
            <audio ref={adAudioRef} preload="none" />
        </>
    );
};