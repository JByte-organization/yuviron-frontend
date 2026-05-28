'use client';

import { useEffect } from 'react';
import Hls from 'hls.js';
import {
    getApiTracksIdPlay,
    postApiAnalyticsPlayStart,
    postApiAnalyticsPlayCommit,
    type TrackStreamUrlResponse,
    type StartPlayResponse,
} from '@repo/api';
import {
    usePlayerStore,
    type PlayerTrack,
    type PlaybackSourceType,
    type PendingAd,
} from '@/entities/player/model/playerStore';
import { playerAudioRef, playerAdAudioRef } from '@/entities/player/lib/playerRefs';

// ══════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════
const CDN_BASE = 'https://dev-i.yuviron.com';
const DEVICE_TYPE = 'WebPlayer' as const;

// ══════════════════════════════════════════════════════════
// MODULE-LEVEL HLS INSTANCE
// Один інстанс на весь застосунок — знищуємо при зміні треку
// ══════════════════════════════════════════════════════════
let hlsInstance: Hls | null = null;

const destroyHls = () => {
    if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
    }
};

// ══════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════

/** Формує абсолютний URL для HLS потоку */
const buildAudioUrl = (rawUrl: string): string => {
    if (!rawUrl.startsWith('/')) return rawUrl;
    // NEXT_PUBLIC_API_URL = "https://domain/api" → беремо тільки origin
    const base = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '');
    return `${base}${rawUrl}`;
};

/** Запускає HLS відтворення через hls.js або нативний Safari HLS */
const startHlsPlayback = (audioUrl: string, onPlaying: () => void): void => {
    const audio = playerAudioRef.current;
    if (!audio) {
        console.error('[Player] Audio element not mounted');
        return;
    }

    destroyHls();

    if (Hls.isSupported()) {
        const hls = new Hls();
        hlsInstance = hls;
        hls.loadSource(audioUrl);
        hls.attachMedia(audio);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            audio.play()
                .then(onPlaying)
                .catch(err => console.error('[Player] play() rejected:', err));
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
            if (!data.fatal) {
                // Нефатальна — hls.js сам відновиться
                console.warn('[Player] HLS non-fatal error:', data.details);
                return;
            }

            // Фатальна — намагаємось відновити
            console.error('[Player] HLS fatal error:', data.type, data.details);

            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
            } else {
                // Мережева або інша — зупиняємо
                destroyHls();
                usePlayerStore.getState().setStatus('idle');
            }
        });

        return;
    }

    // Safari має вбудовану підтримку HLS
    if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        audio.src = audioUrl;
        audio.play()
            .then(onPlaying)
            .catch(err => console.error('[Player] Safari play() rejected:', err));
        return;
    }

    console.error('[Player] HLS is not supported in this browser');
};

/** Відправляє commit сесії відтворення на бекенд */
const commitPlaySession = async (): Promise<void> => {
    const { playSessionId, currentTrack, sourceType, sourceId } = usePlayerStore.getState();
    if (!playSessionId || !currentTrack) return;

    try {
        await postApiAnalyticsPlayCommit({
            playSessionId,
            trackId:    currentTrack.id,
            deviceType: DEVICE_TYPE,
            sourceType: sourceType ?? 'Search',
            sourceId:   sourceId ?? null,
        });
    } catch {
        // Помилка не критична — аналітика може пропустити один commit
    }

    usePlayerStore.getState().setPlaySessionId(null);
};

/** Починає рекламний блок, після завершення викликає onFinished */
const startAdPlayback = (ad: PendingAd, onFinished: () => void): void => {
    const adAudio = playerAdAudioRef.current;
    usePlayerStore.getState().setStatus('ad');
    usePlayerStore.getState().setPendingAd(ad);

    if (!adAudio) {
        onFinished();
        return;
    }

    adAudio.src = `${CDN_BASE}/${ad.audioUrl}`;
    adAudio.play().catch(err => console.error('[Player] Ad play() rejected:', err));

    adAudio.onended = async () => {
        // Повідомляємо бекенд що реклама показана — без цього наступного разу
        // знову прийде реклама (anti-adblock механізм)
        try {
            await fetch(`/api/ads/${ad.adId}/impressions`, { method: 'POST' });
        } catch {
            // silent — не блокуємо відтворення музики
        }

        usePlayerStore.getState().setPendingAd(null);
        onFinished();
    };
};

/** Відкриває аналітичну сесію і зберігає playSessionId */
const startAnalyticsSession = async (trackId: string): Promise<void> => {
    try {
        const res = await postApiAnalyticsPlayStart({ trackId });
        const data = res as unknown as { data?: StartPlayResponse } | StartPlayResponse;
        const sessionId = ('data' in data ? data.data?.playSessionId : (data as StartPlayResponse).playSessionId);
        if (sessionId) {
            usePlayerStore.getState().setPlaySessionId(sessionId);
        }
    } catch {
        // Не критично — трек грає навіть без аналітики
    }
};

// ══════════════════════════════════════════════════════════
// PLAY TRACK
// Основна функція — послідовність: commit → /play → [ad] → /start → HLS
// ══════════════════════════════════════════════════════════
const playTrack = async (track: PlayerTrack): Promise<void> => {
    const store = usePlayerStore.getState();

    // Крок 1: завершуємо поточну сесію якщо є
    await commitPlaySession();

    store.setStatus('loading');
    store.setCurrentTrack(track);

    try {
        // Крок 2: отримуємо URL потоку і можливу рекламу
        const res = await getApiTracksIdPlay(track.id);
        const data = res as unknown as { data?: TrackStreamUrlResponse } | TrackStreamUrlResponse;
        const payload: TrackStreamUrlResponse = 'data' in data && data.data
            ? data.data
            : (data as TrackStreamUrlResponse);

        const rawUrl    = payload.audioUrl ?? null;
        const pendingAd = payload.pendingAd ?? null;

        if (!rawUrl) {
            store.setStatus('idle');
            return;
        }

        const audioUrl = buildAudioUrl(rawUrl);
        store.setAudioUrl(audioUrl);

        // Крок 3: функція яка запускає музику після реклами (або одразу)
        const startMusic = async (): Promise<void> => {
            await startAnalyticsSession(track.id);
            startHlsPlayback(audioUrl, () => {
                usePlayerStore.getState().setStatus('playing');
            });
        };

        // Крок 4: якщо є реклама — показуємо спочатку її
        if (pendingAd) {
            startAdPlayback(pendingAd as PendingAd, startMusic);
        } else {
            await startMusic();
        }

    } catch (err) {
        console.error('[Player] playTrack failed:', err);
        store.setStatus('idle');
    }
};

// ══════════════════════════════════════════════════════════
// usePlayer HOOK
// Публічний API для компонентів
// ══════════════════════════════════════════════════════════
export const usePlayer = () => {
    const status    = usePlayerStore(s => s.status);
    const nextTrack = usePlayerStore(s => s.nextTrack);
    const prevTrack = usePlayerStore(s => s.prevTrack);

    // ─── Запуск черги ─────────────────────────────────────
    const playQueue = (
        tracks:     PlayerTrack[],
        startIndex: number,
        sourceType: PlaybackSourceType,
        sourceId:   string | null,
    ): void => {
        usePlayerStore.getState().setQueue(tracks, startIndex, sourceType, sourceId);
        const track = tracks[startIndex];
        if (track) void playTrack(track);
    };

    // ─── Наступний трек ───────────────────────────────────
    const next = async (): Promise<void> => {
        const track = nextTrack();
        if (track) {
            await playTrack(track);
        } else {
            // Черга закінчилась
            await commitPlaySession();
            destroyHls();
            usePlayerStore.getState().setStatus('idle');
            if (playerAudioRef.current) playerAudioRef.current.src = '';
        }
    };

    // ─── Попередній трек або перемотка ────────────────────
    const prev = async (): Promise<void> => {
        const audio = playerAudioRef.current;

        // Якщо трек грає більше 3 секунд — перемотуємо на початок
        if (audio && audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }

        const track = prevTrack();
        if (track) await playTrack(track);
    };

    // ─── Play / Pause ─────────────────────────────────────
    const togglePlay = (): void => {
        const audio = playerAudioRef.current;
        if (!audio) return;

        if (status === 'playing') {
            audio.pause();
            usePlayerStore.getState().setStatus('paused');
        } else if (status === 'paused') {
            void audio.play();
            usePlayerStore.getState().setStatus('playing');
        }
    };

    // ─── Seek ─────────────────────────────────────────────
    const seek = (time: number): void => {
        if (playerAudioRef.current) playerAudioRef.current.currentTime = time;
        usePlayerStore.getState().setCurrentTime(time);
    };

    // ─── Гучність ─────────────────────────────────────────
    const setVolume = (vol: number): void => {
        if (playerAudioRef.current) playerAudioRef.current.volume = vol;
        usePlayerStore.getState().setVolume(vol);
    };

    // ─── beforeunload: commit при закритті вкладки ────────
    useEffect(() => {
        const handleUnload = (): void => {
            const { playSessionId, currentTrack, sourceType, sourceId } = usePlayerStore.getState();
            if (!playSessionId || !currentTrack) return;

            // sendBeacon надійніше ніж fetch при закритті сторінки
            navigator.sendBeacon(
                '/api/analytics/play/commit',
                JSON.stringify({
                    playSessionId,
                    trackId:    currentTrack.id,
                    deviceType: DEVICE_TYPE,
                    sourceType: sourceType ?? 'Search',
                    sourceId:   sourceId ?? null,
                }),
            );
        };

        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, []);

    // ─── onended: автоматично наступний трек ──────────────
    useEffect(() => {
        const audio = playerAudioRef.current;
        if (!audio) return;

        const handleEnded = (): void => { void next(); };
        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    });

    return { playQueue, playTrack, togglePlay, next, prev, seek, setVolume };
};