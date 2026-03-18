export interface Admin {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role: 'SUPER_ADMIN' | 'MODERATOR' | 'CONTENT_MANAGER'; // Внутренние роли
    permissions: string[]; // Список доступов
    lastLoginAt: string;
}