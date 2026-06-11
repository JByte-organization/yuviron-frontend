import { create } from 'zustand';

// ══════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════
export interface PlayerTrack {
    id:           string;
    title:        string;
    artistNames:  string[];
    artistId?:    string;
    albumId?:     string;
    albumTitle?:  string;
    coverUrl?:    string | null;
    durationMs?:  number;
}

export interface PendingAd {
    adId:           string;
    audioUrl:       string;
    imageUrl:       string;
    advertiserName: string;
    title:          string;
    clickUrl?:      string | null;
}

export type PlaybackSourceType = 'Playlist' | 'Album' | 'Search' | 'ArtistProfile';
export type PlaybackDeviceType = 'WebPlayer' | 'DesktopApp' | 'MobileApp';
export type PlayerStatus       = 'idle' | 'loading' | 'playing' | 'paused' | 'ad';

// ══════════════════════════════════════════════════════════
// STATE INTERFACE
// ══════════════════════════════════════════════════════════
interface PlayerState {
    // ─── Поточний трек ────────────────────────────────────
    currentTrack:   PlayerTrack | null;
    audioUrl:       string | null;
    status:         PlayerStatus;

    // ─── Черга треків ─────────────────────────────────────
    queue:          PlayerTrack[];
    queueIndex:     number;
    sourceType:     PlaybackSourceType | null;
    sourceId:       string | null;

    // ─── Аналітична сесія ─────────────────────────────────
    playSessionId:  string | null;

    // ─── Рекламний блок ───────────────────────────────────
    pendingAd:      PendingAd | null;

    // ─── Стан плеєра ──────────────────────────────────────
    currentTime:    number;
    duration:       number;
    volume:         number;
    isMuted:        boolean;
    areAdsEnabled:  boolean;

    // ─── Сеттери ──────────────────────────────────────────
    setQueue:         (tracks: PlayerTrack[], startIndex: number, sourceType: PlaybackSourceType, sourceId: string | null) => void;
    setCurrentTrack:  (track: PlayerTrack | null) => void;
    setAudioUrl:      (url: string | null) => void;
    setStatus:        (status: PlayerStatus) => void;
    setPlaySessionId: (id: string | null) => void;
    setPendingAd:     (ad: PendingAd | null) => void;
    setCurrentTime:   (time: number) => void;
    setDuration:      (duration: number) => void;
    setVolume:        (volume: number) => void;

    // ─── Дії ──────────────────────────────────────────────
    toggleMute:  () => void;
    nextTrack:   () => PlayerTrack | null;
    prevTrack:   () => PlayerTrack | null;
    clearPlayer: () => void;
    setAdsEnabled:    (enabled: boolean) => void;
}

// ══════════════════════════════════════════════════════════
// INITIAL STATE
// ══════════════════════════════════════════════════════════
const INITIAL_STATE = {
    currentTrack:  null,
    audioUrl:      null,
    status:        'idle' as PlayerStatus,
    queue:         [] as PlayerTrack[],
    queueIndex:    0,
    sourceType:    null,
    sourceId:      null,
    playSessionId: null,
    pendingAd:     null,
    currentTime:   0,
    duration:      0,
    volume:        1,
    isMuted:       false,
    areAdsEnabled: process.env.NEXT_PUBLIC_ENABLE_ADS !== 'false',
};

// ══════════════════════════════════════════════════════════
// STORE
// ══════════════════════════════════════════════════════════
export const usePlayerStore = create<PlayerState>((set, get) => ({
    ...INITIAL_STATE,

    // ─── Сеттери ──────────────────────────────────────────
    setCurrentTrack:  track  => set({ currentTrack: track }),
    setAudioUrl:      url    => set({ audioUrl: url }),
    setStatus:        status => set({ status }),
    setPlaySessionId: id     => set({ playSessionId: id }),
    setPendingAd:     ad     => set({ pendingAd: ad }),
    setCurrentTime:   time   => set({ currentTime: time }),
    setDuration:      dur    => set({ duration: dur }),
    setVolume:        vol    => set({ volume: vol }),
    toggleMute:              () => set(s => ({ isMuted: !s.isMuted })),

    setAdsEnabled:    enabled => set({ areAdsEnabled: enabled }),

    // ─── Встановлення черги ───────────────────────────────
    setQueue: (tracks, startIndex, sourceType, sourceId) => set({
        queue:        tracks,
        queueIndex:   startIndex,
        sourceType,
        sourceId,
        currentTrack: tracks[startIndex] ?? null,
    }),

    // ─── Перехід до наступного треку в черзі ─────────────
    nextTrack: () => {
        const { queue, queueIndex } = get();
        const nextIndex = queueIndex + 1;
        if (nextIndex >= queue.length) return null;
        const next = queue[nextIndex];
        set({ queueIndex: nextIndex, currentTrack: next });
        return next ?? null;
    },

    // ─── Перехід до попереднього треку в черзі ────────────
    prevTrack: () => {
        const { queue, queueIndex } = get();
        const prevIndex = queueIndex - 1;
        if (prevIndex < 0) return null;
        const prev = queue[prevIndex];
        set({ queueIndex: prevIndex, currentTrack: prev });
        return prev ?? null;
    },

    // ─── Повне скидання стану плеєра ─────────────────────
    clearPlayer: () => set(INITIAL_STATE),
}));