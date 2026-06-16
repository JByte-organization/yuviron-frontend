'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    usePostApiMeFavoritesTracks,
    useDeleteApiMeFavoritesTracksTrackId,
    getGetApiMeFavoritesTracksQueryKey, // 🚨 ДОДАНО хелпер ключів списку улюблених
} from '@repo/api/client.ts';

interface UseFavoriteTrackOptions {
    initialLiked?: boolean;
}

interface UseFavoriteTrackReturn {
    isLiked: boolean;
    isPending: boolean;
    toggle: (trackId: string) => void;
}

export const useFavoriteTrack = ({
                                     initialLiked = false,
                                 }: UseFavoriteTrackOptions = {}): UseFavoriteTrackReturn => {
    const queryClient = useQueryClient();
    const [isLiked, setIsLiked] = useState(initialLiked);

    // Синхронізуємо локальний стан, якщо проп initialLiked змінився ззовні
    useEffect(() => {
        setIsLiked(initialLiked);
    }, [initialLiked]);

    const { mutate: addToFavorites, isPending: isAdding } =
        usePostApiMeFavoritesTracks();

    const { mutate: removeFromFavorites, isPending: isRemoving } =
        useDeleteApiMeFavoritesTracksTrackId();

    const toggle = (trackId: string) => {
        if (isLiked) {
            // Оптимістично знімаємо лайк в UI (серце стає сірим миттєво)
            setIsLiked(false);

            removeFromFavorites(
                { trackId },
                {
                    // 🚨 ГЛАВНИЙ ФІКС: При успішному видаленні здуваємо кеш списку улюблених треків
                    onSuccess: () => {
                        void queryClient.invalidateQueries({
                            queryKey: getGetApiMeFavoritesTracksQueryKey(),
                        });
                    },
                    onError: () => {
                        // Запит впав — повертаємо червоне серце назад
                        setIsLiked(true);
                    },
                },
            );
        } else {
            // Оптимістично ставимо лайк в UI
            setIsLiked(true);

            addToFavorites(
                { data: { trackId } as any }, // Фікс типізації Orval payload
                {
                    onSuccess: () => {
                        // Також інвалідуємо кеш при додаванні, щоб трек з'явився у Favorites, якщо додали з пошуку
                        void queryClient.invalidateQueries({
                            queryKey: getGetApiMeFavoritesTracksQueryKey(),
                        });
                    },
                    onError: () => {
                        // Запит впав — повертаємо сіре серце назад
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