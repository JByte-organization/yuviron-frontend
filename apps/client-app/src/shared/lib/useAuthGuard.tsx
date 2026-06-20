'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useSessionStore } from '@/entities/session/model/store';
import { AuthRequiredModal } from '@/shared/ui/Modals/AuthRequiredModal/AuthRequiredModal.tsx';

// ══════════════════════════════════════════════════════════
// CONTEXT
// ══════════════════════════════════════════════════════════
interface AuthGuardContextValue {
    requireAuth: (action: () => void) => void;
    isAuthenticated: boolean; // 1. Добавляем тип свойства
}

const AuthGuardContext = createContext<AuthGuardContextValue>({
    requireAuth: (action) => action(),
    isAuthenticated: false,   // 2. Добавляем дефолтное значение
});

export const useAuthGuard = () => useContext(AuthGuardContext);

// ══════════════════════════════════════════════════════════
// PROVIDER — додай в ClientLayout
// ══════════════════════════════════════════════════════════
export const AuthGuardProvider = ({ children }: { children: React.ReactNode }) => {
    const [showModal, setShowModal] = useState(false);
    const accessToken = useSessionStore(s => s.accessToken);

    // Выносим булево значение (приводим к boolean через двойное отрицание)
    const isAuthenticated = useMemo(() => !!accessToken, [accessToken]);

    const requireAuth = useCallback((action: () => void) => {
        if (accessToken) {
            action();
        } else {
            setShowModal(true);
        }
    }, [accessToken]);

    // Чтобы избежать лишних ререндеров, мемоизируем объект контекста
    const contextValue = useMemo(() => ({
        requireAuth,
        isAuthenticated
    }), [requireAuth, isAuthenticated]);

    return (
        <AuthGuardContext.Provider value={contextValue}> {/* 3. Передаем новое значение */}
            {children}
            <AuthRequiredModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </AuthGuardContext.Provider>
    );
};