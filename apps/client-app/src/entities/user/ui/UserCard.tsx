import React from 'react';
import Link from 'next/link';

export interface UserCardData {
    id: string;
    name: string;
    avatarUrl?: string | null;
    /** Якщо це артист — показуємо підпис "Виконавець" */
    isArtist?: boolean;
    artistId?: string;
}

interface UserCardProps {
    user: UserCardData;
}

export const UserCard = ({ user }: UserCardProps) => {
    const avatarSrc = user.avatarUrl
        ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${user.avatarUrl}`
        : `https://picsum.photos/seed/user-${user.id}/120/120`;

    const href = user.isArtist && user.artistId
        ? `/artists/${user.artistId}`
        : `/user/${user.id}`;

    return (
        <Link href={href} className="user-card">
            <div className="user-card__avatar">
                <img src={avatarSrc} alt={user.name} />
            </div>
            <p className="user-card__name">{user.name}</p>
            {user.isArtist && (
                <p className="user-card__type">Виконавець</p>
            )}
        </Link>
    );
};