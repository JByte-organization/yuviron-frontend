const STORAGE_KEY = 'last_playlist';
const TTL_MS = 24 * 60 * 60 * 1000; // 24 години

interface LastPlaylist {
    id: string;
    name: string;
    savedAt: number;
}

export const lastPlaylistStorage = {
    get(): LastPlaylist | null {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            const data: LastPlaylist = JSON.parse(raw);
            // Перевіряємо TTL
            if (Date.now() - data.savedAt > TTL_MS) {
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }
            return data;
        } catch {
            return null;
        }
    },

    set(id: string, name: string): void {
        try {
            const data: LastPlaylist = { id, name, savedAt: Date.now() };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {
            // ignore
        }
    },

    clear(): void {
        localStorage.removeItem(STORAGE_KEY);
    },
};