'use client';
import { useSessionStore, selectIsAuthenticated } from '@/entities/session/model/store';
import { HomePage } from '@/views/home/HomePage';

export default function Page() {
    const isAuthenticated = useSessionStore(selectIsAuthenticated);
    return <HomePage isAuthenticated={isAuthenticated} />;
}