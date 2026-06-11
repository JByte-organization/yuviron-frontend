'use client';
import { useSessionStore } from '@/entities/session/model/store';
import { HomePage } from '@/views/home/HomePage';

export default function Page() {
    const accessToken = useSessionStore(s => s.accessToken);
    return <HomePage isAuthenticated={!!accessToken} />;
}