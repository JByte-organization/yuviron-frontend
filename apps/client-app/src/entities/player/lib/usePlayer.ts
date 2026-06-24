'use client';

import { useEffect } from 'react';
import Hls from 'hls.js';
import {
    getApiTracksIdPlay,
    postApiAnalyticsPlayStart,
    postApiAnalyticsPlayCommit,
    customInstance,
    type TrackStreamUrlResponse,
    type StartPlayResponse,
} from '@repo/api/client';
import {
    usePlayerStore,
    type PlayerTrack,
    type PlaybackSourceType,
    type PendingAd,
} from '@/entities/player/model/playerStore';
import { playerAudioRef, playerAdAudioRef, audioAnalyticsRef } from '@/entities/player/lib/playerRefs';
import { useSessionStore } from '@/entities/session/model/store.ts';

// ══════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════
const CDN_BASE   = 'https://dev-i.yuviron.com';
const DEVICE_TYPE = 'WebPlayer' as const;

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
 */
const buildAudioUrl = (rawUrl: string): string => {
    // 1. Проверяем входящие данные
    if (!rawUrl) {
        console.error('[Player:buildAudioUrl] КРИТИЧЕСКАЯ ОШИБКА: rawUrl пустой или undefined!');
        return '';
    }

    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
        return rawUrl;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dev-api.yuviron.com/api';

    try {
        // Использование класса URL автоматически подсветит ошибку, если apiUrl кривой
        const { origin } = new URL(apiUrl);
        const finalUrl = `${origin}${rawUrl}`;

        // 2. Логируем успешный результат (удалить перед деплоем в прод, чтобы не спамить)
        console.log(`[Player:buildAudioUrl] Успешно склеено:\nВход: ${rawUrl}\nВыход: ${finalUrl}`);

        return finalUrl;
    } catch (error) {
        // 3. Перехватываем ошибки парсинга домена
        console.error('[Player:buildAudioUrl] Ошибка при парсинге доменов:', {
            apiConfigValue: process.env.NEXT_PUBLIC_API_URL,
            fallbackUsed: 'https://dev-api.yuviron.com/api',
            rawUrl,
            error
        });

        // На всякий случай откатываемся к старому регулярному выражению, если URL был странным
        const originFallback = apiUrl.replace(/\/api.*$/, '');
        return `${originFallback}${rawUrl}`;
    }
};

/**
 * Запускає HLS відтворення.
 * Підтримує Silent Retry при 401/403 та прокидує підписи через xhrSetup.
 */
const startHlsPlayback = (
    audioUrl:  string,
    trackId:   string,
    onPlaying: () => void,
): void => {
    const audio = playerAudioRef.current;
    if (!audio) return;

    destroyHls();

    if (Hls.isSupported()) {
        let searchParams = '';
        try { searchParams = new URL(audioUrl).search; } catch (e) {}

        const hls = new Hls({
            fragLoadingMaxRetry: 0,
            manifestLoadingMaxRetry: 0,
            xhrSetup: (xhr, url) => {
                if (!url.includes('sig=') && searchParams) {
                    const separator = url.includes('?') ? '&' : '?';
                    const signedUrl = `${url}${separator}${searchParams.slice(1)}`;
                    xhr.open('GET', signedUrl, true);
                }
            }
        });

        hlsInstance = hls;
        hls.loadSource(audioUrl);
        hls.attachMedia(audio);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            audio.play().then(onPlaying).catch(err => console.error(err));
        });

        hls.on(Hls.Events.ERROR, async (_, data) => {
            const isAuthError =
                data.response?.code === 401 ||
                data.response?.code === 403 ||
                data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR ||
                data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR;

            if (isAuthError && !isRetryingToken) {
                isRetryingToken = true;
                console.warn('[Player] Signed URL expired, refreshing...');

                try {
                    const currentTime = audio.currentTime;

                    // 🚨 КРИТИЧЕСКИЙ ФИКС: Перед перезапуском HLS закрываем текущий чанк прослушивания,
                    // чтобы время разрыва не записалось в аналитику как пустой кусок
                    audioAnalyticsRef.closeCurrentChunk();

                    const newUrl = await refreshStreamUrl(trackId);

                    if (newUrl) {
                        startHlsPlayback(newUrl, trackId, () => {
                            if (audio && currentTime > 0) {
                                audio.currentTime = currentTime;
                            }
                            usePlayerStore.getState().setAudioUrl(newUrl);
                        });
                    }
                } catch {
                    destroyHls();
                    usePlayerStore.getState().setStatus('idle');
                } finally {
                    isRetryingToken = false;
                }
                return;
            }

            if (!data.fatal) return;
            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
            } else {
                destroyHls();
                usePlayerStore.getState().setStatus('idle');
            }
        });

        return;
    }

    if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        audio.src = audioUrl;
        audio.play().then(onPlaying).catch(err => console.error(err));
        return;
    }
};

/** Отримує свіжий Signed URL для поточного треку. */
const refreshStreamUrl = async (trackId: string): Promise<string | null> => {
    const res = await getApiTracksIdPlay(trackId);
    const data = res as unknown as { data?: TrackStreamUrlResponse } | TrackStreamUrlResponse;
    const payload: TrackStreamUrlResponse = 'data' in data && data.data ? data.data : (data as TrackStreamUrlResponse);

    const rawUrl = payload.audioUrl ?? null;
    if (!rawUrl) return null;

    return buildAudioUrl(rawUrl);
};

/** Відправляє commit аналітичної сесії */
const commitPlaySession = async (): Promise<void> => {
    const { playSessionId, currentTrack, sourceType, sourceId } = usePlayerStore.getState();
    if (!playSessionId || !currentTrack) return;

    // 1. Закрываем текущий отрезок перед отправкой на бэк
    audioAnalyticsRef.closeCurrentChunk();

    // 2. Вытягиваем все накопленные за время прослушивания трека отрезки (chunks)
    const collectedChunks = audioAnalyticsRef.getChunks();

    try {
        // Передаем chunks в тело запроса для ClickHouse согласно спецификации нового API бэкенда
        await postApiAnalyticsPlayCommit({
            playSessionId,
            trackId:    currentTrack.id,
            deviceType: DEVICE_TYPE,
            sourceType: sourceType ?? 'Search',
            sourceId:   sourceId ?? null,
            chunks:     collectedChunks as any // <-- ИНТЕГРАЦИЯ ЧАНКОВ В СИСТЕМУ
        });

        // 3. Очищаем массив чанков в памяти после успешной фиксации сессии
        audioAnalyticsRef.clearChunks();
    } catch (err) {
        console.error('[Analytics] Failed to commit chunks payload:', err);
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

    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;
        usePlayerStore.getState().setPendingAd(null);
        onFinished();
    };

    const handleAdEnded = async () => {
        try {
            await customInstance(`/api/ads/${ad.adId}/impressions`, {
                method: 'POST',
                body: JSON.stringify({ context: 'ClientPlayer' }),
            });
        } catch {
            // silent — не блокуємо відтворення треку при збої запиту
        }
        finish();
    };

    const handleAdError = () => {
        console.error('[Player] Ad media error, skipping ad');
        finish();
    };

    adAudio.addEventListener('ended', handleAdEnded, { once: true });
    adAudio.addEventListener('error', handleAdError, { once: true });

    adAudio.src = `${CDN_BASE}/${ad.audioUrl}`;
    adAudio.play().catch(err => {
        console.error('[Player] Ad play() rejected:', err);
        adAudio.removeEventListener('ended', handleAdEnded);
        adAudio.removeEventListener('error', handleAdError);
        finish();
    });
};

/** Відкриває аналітичну сесію */
const startAnalyticsSession = async (trackId: string): Promise<void> => {
    try {
        const res = await postApiAnalyticsPlayStart({ trackId });
        const data = res as unknown as { data?: StartPlayResponse } | StartPlayResponse;
        const sessionId = 'data' in data ? data.data?.playSessionId : (data as StartPlayResponse).playSessionId;
        if (sessionId) {
            usePlayerStore.getState().setPlaySessionId(sessionId);
        }
    } catch {
        // Не критично
    }
};

/** Основна логіка запуску треку */
const playTrack = async (track: PlayerTrack): Promise<void> => {
    const store = usePlayerStore.getState();

    await commitPlaySession();

    store.setStatus('loading');
    store.setCurrentTrack(track);

    try {
        const res = await getApiTracksIdPlay(track.id);
        const data = res as unknown as { data?: TrackStreamUrlResponse } | TrackStreamUrlResponse;
        const payload: TrackStreamUrlResponse = 'data' in data && data.data ? data.data : (data as TrackStreamUrlResponse);

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
            startHlsPlayback(audioUrl, track.id, () => {
                usePlayerStore.getState().setStatus('playing');
            });
        };

        if (pendingAd && store.areAdsEnabled) {
            console.log('[Player:Ads] Инициализация рекламного блока...');
            startAdPlayback(pendingAd as PendingAd, startMusic);
        } else {
            if (pendingAd && !store.areAdsEnabled) {
                console.log('[Player:Ads] Рекламный блок обнаружен, но пропущен согласно флагам конфигурации.');
            }
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

            // ФІКС: Беремо токен прямо під час виклику івенту, а не на старті модуля
            const currentToken = useSessionStore.getState().accessToken;
            if (!currentToken) return;

            // Збираємо повне тіло запиту з реальними даними
            const payload = {
                playSessionId,
                trackId:    currentTrack.id,
                deviceType: DEVICE_TYPE,
                sourceType: sourceType ?? 'Search',
                sourceId:   sourceId ?? null,
            };

            fetch('/api/analytics/play/commit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`
                },
                body: JSON.stringify(payload),
                keepalive: true,
            });
        };

        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, []);

    return { playQueue, playTrack, togglePlay, next, prev, seek, setVolume };
};