'use client';

import React from 'react';
import Link from 'next/link';

interface UserDropdownProps {
    userId?: string;
    isPremium?: boolean;
    isArtist?: boolean;
    onClose: () => void;
    onLogout: () => void;
}

export const UserDropdown = ({
                                 userId,
                                 isPremium = false,
                                 isArtist = false,
                                 onClose,
                                 onLogout,
                             }: UserDropdownProps) => {

    const items = [
        {
            icon: 'bi-person-circle',
            label: 'Профіль',
            href: `/users/${userId}`,
            show: true,
        },
        {
            icon: 'bi-stars',
            label: isPremium ? 'Управління Premium' : 'Перейти на Premium',
            href: isPremium ? '/premium/manage' : '/premium',
            show: true,
            accent: true,
        },
        {
            icon: 'bi-bell',
            label: 'Повідомлення',
            href: '/notifications',
            show: true,
        },
        {
            icon: 'bi-sliders', // Більш технологічна іконка замість шестерні
            label: 'Налаштування',
            href: '/settings',
            show: true,
        },
        {
            icon: 'bi-shield-lock',
            label: 'Дані акаунту',
            href: '/account-settings',
            target: '_blank',
            show: true,
        },
        {
            icon: isArtist ? 'bi-music-note-beamed' : 'bi-mic',
            label: isArtist ? 'Кабінет артиста' : 'Стати артистом',
            href: isArtist ? '/artist-dashboard' : '/become-artist',
            show: true,
        },
    ].filter((item) => item.show);

    return (
        <>
            {/* Напівпрозорий закриваючий оверлей */}
            <div className="user-dropdown__overlay" onClick={onClose} />

            <div className="user-dropdown">
                <ul className="user-dropdown__list">
                    {items.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                target={item.target}
                                className={`user-dropdown__item${item.accent ? ' user-dropdown__item--accent' : ''}`}
                                onClick={onClose}
                            >
                                <i className={`bi ${item.icon} user-dropdown__item-icon`} />
                                <span className="item-label-text">{item.label}</span>
                            </Link>
                        </li>
                    ))}

                    <li className="user-dropdown__divider" />

                    <li>
                        <button
                            type="button"
                            className="user-dropdown__item user-dropdown__item--logout"
                            onClick={() => { onLogout(); onClose(); }}
                        >
                            <i className="bi bi-box-arrow-right user-dropdown__item-icon" />
                            <span className="item-label-text">Вийти</span>
                        </button>
                    </li>
                </ul>
            </div>
        </>
    );
};