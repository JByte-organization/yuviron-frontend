'use client';
import { useSessionStore, selectIsAuthenticated } from '@/entities/session/model/store';
import { HomePage } from '@/views/home/HomePage';

export default function Page() {
    // За статусом, а не за токеном: під час refresh показуємо авторизований
    // варіант (за підказкою), щоб не блимнути гостьовою домашньою.
    const isAuthenticated = useSessionStore(selectIsAuthenticated);
    return <HomePage isAuthenticated={isAuthenticated} />;
}