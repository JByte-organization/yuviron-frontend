'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

// ══════════════════════════════════════════════════════════
// CONTEXT
// ══════════════════════════════════════════════════════════
interface ToastData {
    trackId: string;
    trackTitle: string;
    playlistName: string;
    playlistId: string;
}

interface PlaylistToastContextValue {
    showToast: (data: ToastData) => void;
    openChangeModal: (trackId: string) => void;
}

export const PlaylistToastContext = createContext<PlaylistToastContextValue>({
    showToast: () => {},
    openChangeModal: () => {},
});

export const usePlaylistToast = () => useContext(PlaylistToastContext);

// ══════════════════════════════════════════════════════════
// PROVIDER + TOAST UI
// ══════════════════════════════════════════════════════════
interface PlaylistToastProviderProps {
    children: React.ReactNode;
    onOpenChange?: (trackId: string) => void;
}

export const PlaylistToastProvider = ({
                                          children,
                                          onOpenChange,
                                      }: PlaylistToastProviderProps) => {
    const [toast, setToast] = useState<ToastData | null>(null);
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = useCallback((data: ToastData) => {
        // Скасовуємо попередній таймер
        if (timerRef.current) clearTimeout(timerRef.current);

        setToast(data);
        setVisible(true);

        // Автоматично ховаємо через 4 секунди
        timerRef.current = setTimeout(() => {
            setVisible(false);
        }, 4000);
    }, []);

    const openChangeModal = useCallback((trackId: string) => {
        setVisible(false);
        onOpenChange?.(trackId);
    }, [onOpenChange]);

    const handleChange = () => {
        if (!toast) return;
        openChangeModal(toast.trackId);
    };

    return (
        <PlaylistToastContext.Provider value={{ showToast, openChangeModal }}>
            {children}

            {/* Toast */}
            <div className={`playlist-toast${visible ? ' playlist-toast--visible' : ''}`}>
                {toast && (
                    <>
                        <div className="playlist-toast__icon">
                            <i className="bi bi-collection-fill" />
                        </div>
                        <p className="playlist-toast__text">
                            Додано до плейліста{' '}
                            <strong>«{toast.playlistName}»</strong>.
                        </p>
                        <button
                            className="playlist-toast__change-btn"
                            onClick={handleChange}
                        >
                            Змінити
                        </button>
                    </>
                )}
            </div>
        </PlaylistToastContext.Provider>
    );
};