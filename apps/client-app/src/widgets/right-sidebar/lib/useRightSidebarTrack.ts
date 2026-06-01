import { useEffect } from 'react';
import { usePlayerStore } from '@/entities/player/model/playerStore';
import { useRightSidebar } from '@/widgets/layout/model/contexts';

/**
 * Хук слідкує за зміною currentTrack в playerStore.
 * Коли починає грати новий трек — відкриває правий сайдбар.
 *
 * Поведінка:
 * - Перший трек у сесії → сайдбар відкривається автоматично
 * - Юзер закрив сайдбар → більше не відкривається (userClosed = true)
 * - Зміна треку не відкриває сайдбар якщо юзер його закрив
 *
 * Використовується в ClientLayout або в PlayerBar.
 */
export const useRightSidebarTrack = () => {
    const { open } = useRightSidebar();
    const currentTrack = usePlayerStore(s => s.currentTrack);

    useEffect(() => {
        if (currentTrack) {
            // open() всередині перевіряє userClosed — якщо юзер закрив, не відкриє
            open();
        }
    }, [currentTrack?.id]); // eslint-disable-line react-hooks/exhaustive-deps
};