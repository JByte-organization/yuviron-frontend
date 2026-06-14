export interface AudioChunk {
    startSecond: number;
    endSecond: number;
}

export const playerAudioRef: { current: HTMLAudioElement | null } = { current: null };
export const playerAdAudioRef: { current: HTMLAudioElement | null } = { current: null };


export const audioAnalyticsRef: {
    getChunks: () => AudioChunk[];
    clearChunks: () => void;
    closeCurrentChunk: () => void;
} = {
    getChunks: () => [],
    clearChunks: () => {},
    closeCurrentChunk: () => {},
};