'use client';

import { useEffect } from 'react';
import Hls from 'hls.js';
import {
    getApiTracksIdPlay,
    postApiAnalyticsPlayStart,
    postApiAnalyticsPlayCommit,
    type TrackStreamUrlResponse,
    type StartPlayResponse,
} from '@repo/api/client';
import {
    usePlayerStore,
    type PlayerTrack,
    type PlaybackSourceType,
    type PendingAd,
} from '@/entities/player/model/playerStore';
import { playerAudioRef, playerAdAudioRef } from '@/entities/player/lib/playerRefs';
import { useSessionStore } from '@/entities/session/model/store.ts';

// ══════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════
const CDN_BASE   = 'https://dev-i.yuviron.com';
const DEVICE_TYPE = 'WebPlayer' as const;
const token = useSessionStore.getState().accessToken;

// ══════════════════════════════════════════════════════════
// MODULE-LEVEL STATE
// ══════════════════════════════════════════════════════════
let hlsInstance: Hls | null = null;

// Silent Retry: захист від подвійного ретрая при одночасних помилках
let isRetryingToken = false;

const destroyHls = () => {
    if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
    }
};

// ══════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════

/**
 * Формує абсолютний URL для HLS потоку.
 *
 * Проблема: NEXT_PUBLIC_* змінні вбудовуються під час next build.
 * Якщо на сервері змінна не передана в Docker — буде undefined,
 * і відносний URL /api/stream/... резолвиться до Next.js домену замість бекенду.
 *
 * Рішення: якщо URL вже абсолютний (починається з http) — повертаємо як є.
 * Бекенд з Signed URLs повертає вже абсолютний URL з токенами.
 */
const buildAudioUrl = (rawUrl: string): string => {
    // Абсолютний URL — повертаємо без змін (Signed URL вже містить домен і токени)
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
        return rawUrl;
    }

    // Відносний URL — підставляємо origin бекенду
    // NEXT_PUBLIC_API_URL = "https://dev-api.yuviron.com/api" → беремо origin
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
    const origin = apiUrl.replace(/\/api.*$/, ''); // Відрізаємо /api і все після

    return `${origin}${rawUrl}`;
};

// const buildAudioUrl = (rawUrl: string): string => {
//     // Якщо URL вже абсолютний — повертаємо як є
//     if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
//         return rawUrl;
//     }
//
//     const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dev-api.yuviron.com/api';
//     const origin = apiUrl.replace(/\/api.*$/, '');
//
//     return `${origin}${rawUrl}`;
// };

/**
 * Запускає HLS відтворення.
 * Підтримує Silent Retry при 401/403 (зміна IP, протухлий Signed URL).
 */
const startHlsPlayback = (
    audioUrl:  string,
    trackId:   string,
    onPlaying: () => void,
): void => {
    const audio = playerAudioRef.current;
    if (!audio) {
        console.error('[Player] Audio element not mounted');
        return;
    }

    destroyHls();

    if (Hls.isSupported()) {
        const hls = new Hls({
            // Зменшуємо кількість автоматичних ретраїв hls.js —
            // бо при 401 нам потрібен власний ретрай з новим токеном
            fragLoadingMaxRetry: 0,
            manifestLoadingMaxRetry: 0,
        });
        hlsInstance = hls;
        hls.loadSource(audioUrl);
        hls.attachMedia(audio);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            audio.play()
                .then(onPlaying)
                .catch(err => console.error('[Player] play() rejected:', err));
        });

        hls.on(Hls.Events.ERROR, async (_, data) => {
            // ── Silent Retry: 401/403 при зміні IP ───────────────
            // Бекенд підписує URL за IP-адресою. При переключенні Wi-Fi → LTE
            // старий токен стає недійсним і бекенд повертає 401/403.
            // Тихо отримуємо новий Signed URL і продовжуємо відтворення.
            const isAuthError =
                data.response?.code === 401 ||
                data.response?.code === 403 ||
                data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR ||
                data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR;

            if (isAuthError && !isRetryingToken) {
                isRetryingToken = true;
                console.warn('[Player] Signed URL expired or IP changed, refreshing token...');

                try {
                    const currentTime = audio.currentTime; // Запам'ятовуємо позицію
                    const newUrl      = await refreshStreamUrl(trackId);

                    if (newUrl) {
                        // Перезапускаємо HLS з новим URL — продовжуємо з тієї ж секунди
                        startHlsPlayback(newUrl, trackId, () => {
                            // Відновлюємо позицію після підключення
                            if (audio && currentTime > 0) {
                                audio.currentTime = currentTime;
                            }
                            usePlayerStore.getState().setAudioUrl(newUrl);
                        });
                    }
                } catch {
                    console.error('[Player] Token refresh failed, stopping playback');
                    destroyHls();
                    usePlayerStore.getState().setStatus('idle');
                } finally {
                    isRetryingToken = false;
                }
                return;
            }

            // ── Звичайна обробка помилок ──────────────────────────
            if (!data.fatal) {
                console.warn('[Player] HLS non-fatal error:', data.details);
                return;
            }

            console.error('[Player] HLS fatal error:', data.type, data.details);

            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
            } else {
                destroyHls();
                usePlayerStore.getState().setStatus('idle');
            }
        });

        return;
    }

    // Safari — нативна підтримка HLS
    if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        audio.src = audioUrl;
        audio.play()
            .then(onPlaying)
            .catch(err => console.error('[Player] Safari play() rejected:', err));
        return;
    }

    console.error('[Player] HLS is not supported in this browser');
};

/**
 * Отримує свіжий Signed URL для поточного треку.
 * Викликається при Silent Retry (зміна IP).
 */
const refreshStreamUrl = async (trackId: string): Promise<string | null> => {
    const res = await getApiTracksIdPlay(trackId);
    const data = res as unknown as { data?: TrackStreamUrlResponse } | TrackStreamUrlResponse;
    const payload: TrackStreamUrlResponse = 'data' in data && data.data
        ? data.data
        : (data as TrackStreamUrlResponse);

    const rawUrl = payload.audioUrl ?? null;
    if (!rawUrl) return null;

    return buildAudioUrl(rawUrl);
};

/** Відправляє commit аналітичної сесії */
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
        // Не критично
    }

    usePlayerStore.getState().setPlaySessionId(null);
};

/** Запускає рекламний блок */
const startAdPlayback = (ad: PendingAd, onFinished: () => void): void => {
    const adAudio = playerAdAudioRef.current;
    const store = usePlayerStore.getState();

    store.setStatus('ad');
    store.setPendingAd(ad);

    if (!adAudio) {
        onFinished();
        return;
    }

    adAudio.src = `${CDN_BASE}/${ad.audioUrl}`;
    adAudio.play().catch(err => console.error('[Player] Ad play() rejected:', err));

    // ФІКС: Безпечна одноразова підписка без затирання лінком .onended
    const handleAdEnded = async () => {
        try {
            await fetch(`/api/ads/${ad.adId}/impressions`, { method: 'POST' });
        } catch {
            // silent
        }
        usePlayerStore.getState().setPendingAd(null);
        onFinished();
    };

    adAudio.addEventListener('ended', handleAdEnded, { once: true });
};

/** Відкриває аналітичну сесію */
const startAnalyticsSession = async (trackId: string): Promise<void> => {
    try {
        const res = await postApiAnalyticsPlayStart({ trackId });
        const data = res as unknown as { data?: StartPlayResponse } | StartPlayResponse;
        const sessionId = 'data' in data
            ? data.data?.playSessionId
            : (data as StartPlayResponse).playSessionId;
        if (sessionId) {
            usePlayerStore.getState().setPlaySessionId(sessionId);
        }
    } catch {
        // Не критично
    }
};

// ══════════════════════════════════════════════════════════
// PLAY TRACK
// Послідовність: commit → /play → [ad] → analytics → HLS
// ══════════════════════════════════════════════════════════
const playTrack = async (track: PlayerTrack): Promise<void> => {
    const store = usePlayerStore.getState();

    await commitPlaySession();

    store.setStatus('loading');
    store.setCurrentTrack(track);

    try {
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

        const startMusic = async (): Promise<void> => {
            await startAnalyticsSession(track.id);
            // Передаємо trackId в startHlsPlayback для Silent Retry
            startHlsPlayback(audioUrl, track.id, () => {
                usePlayerStore.getState().setStatus('playing');
            });
        };

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
// ══════════════════════════════════════════════════════════
export const usePlayer = () => {
    const status    = usePlayerStore(s => s.status);
    const nextTrack = usePlayerStore(s => s.nextTrack);
    const prevTrack = usePlayerStore(s => s.prevTrack);

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

    const next = async (): Promise<void> => {
        const track = nextTrack();
        if (track) {
            await playTrack(track);
        } else {
            await commitPlaySession();
            destroyHls();
            usePlayerStore.getState().setStatus('idle');
            if (playerAudioRef.current) playerAudioRef.current.src = '';
        }
    };

    const prev = async (): Promise<void> => {
        const audio = playerAudioRef.current;
        if (audio && audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }
        const track = prevTrack();
        if (track) await playTrack(track);
    };

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

    const seek = (time: number): void => {
        if (playerAudioRef.current) playerAudioRef.current.currentTime = time;
        usePlayerStore.getState().setCurrentTime(time);
    };

    const setVolume = (vol: number): void => {
        if (playerAudioRef.current) playerAudioRef.current.volume = vol;
        usePlayerStore.getState().setVolume(vol);
    };

    // commit при закритті вкладки
    useEffect(() => {
        const handleUnload = (): void => {
            const { playSessionId, currentTrack, sourceType, sourceId } = usePlayerStore.getState();
            if (!playSessionId || !currentTrack) return;
            if (token) {
                fetch('/api/analytics/play/commit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ /* ваші дані */ }),
                    keepalive: true,
                });
            }
        };
        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, []); // ФІКС: тепер подія не перепідписується щоразу


    return { playQueue, playTrack, togglePlay, next, prev, seek, setVolume };
};