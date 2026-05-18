/**
 * Формує URL зображення з медіа-домену.
 *
 * Бекенд повертає шлях у форматі "папка/хеш" (наприклад "banners/a9285ad7...")
 * або просто хеш. Ця функція витягує тільки хеш і склеює з базовим URL.
 *
 * @example
 * getImageUrl("banners/a9285ad7348141f9ad8054413d60abfc")
 * // → "https://dev-i.yuviron.com/a9285ad7348141f9ad8054413d60abfc"
 *
 * getImageUrl("2e5747900bb1478eb59f5278a88cec2f")
 * // → "https://dev-i.yuviron.com/2e5747900bb1478eb59f5278a88cec2f"
 *
 * getImageUrl(null) // → null
 */

const IMAGE_BASE_URL = 'https://dev-i.yuviron.com';

export const getImageUrl = (path?: string | null): string | null => {
    if (!path) return null;
    const hash = path.split('/').pop();
    if (!hash) return null;
    return `${IMAGE_BASE_URL}/${hash}`;
};