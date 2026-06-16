
const STORAGE_KEY = 'yuviron.deviceFingerprint';

let cachedId: string | null = null;
let pending: Promise<string | null> | null = null;

export const getDeviceFingerprint = async (): Promise<string | null> => {
    if (typeof window === 'undefined') return null;

    if (cachedId) return cachedId;

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            cachedId = stored;
            return stored;
        }
    } catch {
    }

    if (!pending) {
        pending = (async () => {
            try {
                const FingerprintJS = await import('@fingerprintjs/fingerprintjs');
                const fp = await FingerprintJS.load();
                const result = await fp.get();
                cachedId = result.visitorId;
                try {
                    localStorage.setItem(STORAGE_KEY, cachedId);
                } catch {
                }
                return cachedId;
            } catch (error) {
                console.warn('[fingerprint] generation failed:', error);
                return null;
            } finally {
                pending = null;
            }
        })();
    }

    return pending;
};
