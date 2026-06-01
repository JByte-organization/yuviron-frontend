'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useSessionStore } from '@/entities/session/model/store';
import { AuthRequiredModal } from '@/shared/ui/AuthRequiredModal';

// ══════════════════════════════════════════════════════════
// CONTEXT
// ══════════════════════════════════════════════════════════
interface AuthGuardContextValue {
    requireAuth: (action: () => void) => void;
}

const AuthGuardContext = createContext<AuthGuardContextValue>({
    requireAuth: (action) => action(),
});

export const useAuthGuard = () => useContext(AuthGuardContext);

// ══════════════════════════════════════════════════════════
// PROVIDER — додай в ClientLayout
// ══════════════════════════════════════════════════════════
export const AuthGuardProvider = ({ children }: { children: React.ReactNode }) => {
    const [showModal, setShowModal] = useState(false);
    const accessToken = useSessionStore(s => s.accessToken);

    const requireAuth = useCallback((action: () => void) => {
        if (accessToken) {
            action();
        } else {
            setShowModal(true);
        }
    }, [accessToken]);

    return (
        <AuthGuardContext.Provider value={{ requireAuth }}>
            {children}
            <AuthRequiredModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </AuthGuardContext.Provider>
    );
};