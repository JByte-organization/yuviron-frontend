import { useEffect, useState } from 'react';

/**
 * Хук для задержки обновления значения.
 * @param value — значение, которое нужно "задебаунсить"
 * @param delay — задержка в миллисекундах (по умолчанию 500)
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Устанавливаем таймер на обновление значения
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Очищаем таймер, если значение изменилось до истечения задержки
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}