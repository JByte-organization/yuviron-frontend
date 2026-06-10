/**
 * Форматирует числа в компактный журнальный вид (например: 1.2M, 45.3K)
 */
export const formatNumber = (n?: number): string => {
    if (!n) return '0';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
};