import { useState } from 'react';
import {
    usePostApiMeFavoritesTracks,
    useDeleteApiMeFavoritesTracksTrackId,
} from '@repo/api/client.ts';

interface UseFavoriteTrackOptions {
    // Початковий стан — чи трек вже в улюблених
    // Передаємо з батьківського компонента якщо знаємо
    initialLiked?: boolean;
}

interface UseFavoriteTrackReturn {
    isLiked: boolean;
    isPending: boolean;
    toggle: (trackId: string) => void;
}

/**
 * Хук для додавання/видалення треку з улюблених.
 *
 * Використання:
 * const { isLiked, isPending, toggle } = useFavoriteTrack({ initialLiked: track.isLiked });
 *
 * Оптимістичний UI:
 * Стан змінюється одразу при кліку (не чекаємо відповідь сервера).
 * Якщо запит падає — стан повертається назад.
 *
 * TODO: коли зʼявиться поле isLiked в DTO треку — передавати initialLiked з даних API.
 */
export const useFavoriteTrack = ({
                                     initialLiked = false,
                                 }: UseFavoriteTrackOptions = {}): UseFavoriteTrackReturn => {
    // Локальний стан — оптимістичний UI
    const [isLiked, setIsLiked] = useState(initialLiked);

    const { mutate: addToFavorites, isPending: isAdding } =
        usePostApiMeFavoritesTracks();

    const { mutate: removeFromFavorites, isPending: isRemoving } =
        useDeleteApiMeFavoritesTracksTrackId();

    const toggle = (trackId: string) => {
        if (isLiked) {
            // Оптимістично знімаємо лайк
            setIsLiked(false);
            removeFromFavorites(
                { trackId },
                {
                    onError: () => {
                        // Запит впав — повертаємо назад
                        setIsLiked(true);
                    },
                },
            );
        } else {
            // Оптимістично ставимо лайк
            setIsLiked(true);
            addToFavorites(
                { data: { trackId } },
                {
                    onError: () => {
                        // Запит впав — повертаємо назад
                        setIsLiked(false);
                    },
                },
            );
        }
    };

    return {
        isLiked,
        isPending: isAdding || isRemoving,
        toggle,
    };
};