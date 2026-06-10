/**
 * Формує URL зображення з медіа-домену.
 *
 * Бекенд повертає ПОВНИЙ ключ обʼєкта в медіа-сторі — "папка/хеш" або
 * "папка/підпапка/хеш" (наприклад "avatars/d4c4256b...",
 * "artists/banners/7c1d1ae2..."). Медіа-сервер адресує файли саме за цим
 * ключем, тож зберігаємо повний шлях. (Раніше тут лишався тільки останній
 * сегмент — однорівневі аватари випадково працювали, а дворівневі банери 404.)
 *
 * @example
 * getImageUrl("artists/banners/7c1d1ae2e3e646fb8ddb4dade665dadb")
 * // → "https://dev-i.yuviron.com/artists/banners/7c1d1ae2e3e646fb8ddb4dade665dadb"
 *
 * getImageUrl("avatars/d4c4256b0fbd4dd6b60dc27f9487c88d")
 * // → "https://dev-i.yuviron.com/avatars/d4c4256b0fbd4dd6b60dc27f9487c88d"
 *
 * getImageUrl("https://i.scdn.co/image/abc") // → "https://i.scdn.co/image/abc" (вже абсолютний)
 * getImageUrl(null) // → null
 */

const IMAGE_BASE_URL = 'https://dev-i.yuviron.com';

export const getImageUrl = (path?: string | null): string | null => {
    if (!path) return null;
    // Вже абсолютний URL (зовнішні каталожні імпорти) — віддаємо як є.
    if (/^https?:\/\//i.test(path)) return path;
    // Зберігаємо повний ключ обʼєкта, прибравши лише провідні слеші.
    const key = path.replace(/^\/+/, '');
    if (!key) return null;
    return `${IMAGE_BASE_URL}/${key}`;
};