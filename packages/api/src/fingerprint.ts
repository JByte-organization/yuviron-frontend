// Device Fingerprint для бекендового UserDeviceTracker (ТЗ SCRUM-246).
//
// Бек чекає заголовок X-Device-Fingerprint на КОЖНОМУ запиті (критично — на
// /auth/login, /auth/login-with-code, /auth/register, /auth/refresh): без нього
// кожен запит виглядає як вхід з нового пристрою → дублі в БД і фальшиві
// email-сповіщення «новий вхід».
//
// Принципи:
// - генерація РІВНО один раз: localStorage-кеш + in-memory кеш + кеш promise-а
//   (паралельні перші запити не запускають FingerprintJS двічі);
// - SSR-safe: на сервері localStorage/браузерних API немає → повертаємо null,
//   заголовок просто не додається (SSR-запити не є «входом з пристрою»);
// - динамічний import бібліотеки: вона суто браузерна, нічого їй робити
//   в серверному бандлі Next; перший запит чекає ~100-300мс на генерацію;
// - помилка генерації НЕ валить запит — працюємо без заголовка.

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
        // localStorage недоступний (приватний режим зі строгими налаштуваннями
        // тощо) — згенеруємо нижче, просто без персистентності.
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
                    // Не змогли персистнути — переживемо, є in-memory кеш.
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
