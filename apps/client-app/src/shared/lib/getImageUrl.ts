
const IMAGE_BASE_URL = 'https://dev-i.yuviron.com';

export const getImageUrl = (path?: string | null): string | null => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    const hash = path.split('/').pop();
    if (!hash) return null;
    return `${IMAGE_BASE_URL}/${hash}`;
};