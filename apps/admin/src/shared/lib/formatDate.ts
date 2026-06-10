/**
 * Безопасно форматирует строку даты в читаемый вид (например: 10 Jun 2026)
 * Устойчив к пустым значениям и дефолтным системным датам бэкенда (0001-01-01)
 */
export const formatDate = (dateString?: string | null): string => {
    if (!dateString || dateString.trim() === '' || dateString.startsWith('0001')) {
        return '—';
    }
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '—';

        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return '—';
    }
};