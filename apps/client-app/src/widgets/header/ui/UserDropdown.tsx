'use client';

import React from 'react';
import Link from 'next/link';

interface UserDropdownProps {
    userId?: string;
    isPremium?: boolean;
    isArtist?: boolean;
    artistId?: string;
    onClose: () => void;
    onLogout: () => void;
}

export const UserDropdown = ({
                                 userId,
                                 isPremium = false,
                                 isArtist = false,
                                 artistId,
                                 onClose,
                                 onLogout,
                             }: UserDropdownProps) => {
    const items = [
        {
            icon: 'bi-person',
            label: 'Профіль',
            href: `/users/${userId}`,
            show: true,
        },
        {
            icon: 'bi-star',
            label: 'Перейти на Premium',
            href: '/premium',
            show: !isPremium,
            accent: true,
        },
        {
            icon: 'bi-bell',
            label: 'Повідомлення',
            href: '/notifications',
            show: true,
        },
        {
            icon: 'bi-gear',
            label: 'Налаштування',
            href: '/settings',
            show: true,
        },
        {
            icon: 'bi-shield-lock',
            label: 'Дані акаунту',
            href: '/account',
            show: true,
        },
        {
            icon: isArtist ? 'bi-music-note-list' : 'bi-mic',
            label: isArtist ? 'Кабінет артиста' : 'Стати артистом',
            href: isArtist ? `/artists/${artistId}/dashboard` : '/become-artist',
            show: true,
        },
    ].filter((item) => item.show);

    return (
        <>
            {/* Overlay */}
            <div className="user-dropdown__overlay" onClick={onClose} />

            <div className="user-dropdown">
                <ul className="user-dropdown__list">
                    {items.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`user-dropdown__item${item.accent ? ' user-dropdown__item--accent' : ''}`}
                                onClick={onClose}
                            >
                                <i className={`bi ${item.icon} user-dropdown__item-icon`} />
                                {item.label}
                            </Link>
                        </li>
                    ))}

                    <li className="user-dropdown__divider" />

                    <li>
                        <button
                            className="user-dropdown__item user-dropdown__item--logout"
                            onClick={() => { onLogout(); onClose(); }}
                        >
                            <i className="bi bi-box-arrow-right user-dropdown__item-icon" />
                            Вийти
                        </button>
                    </li>
                </ul>
            </div>
        </>
    );
};