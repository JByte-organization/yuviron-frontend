'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
    /** TODO: передавати з хука useGetApiCurrentUser() */
    user?: { avatarUrl?: string | null } | null;
}

export const Header = ({ user }: HeaderProps) => {
    const [query, setQuery] = useState('');

    return (
        <header className="client-header">
            {/* ─── Лого ─────────────────────────────── */}
            <Link href="/home" className="client-header__logo">
                {/* замінити на реальний логотип */}
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M16 2L20 10L29 11.5L22.5 18L24.5 27L16 22.5L7.5 27L9.5 18L3 11.5L12 10L16 2Z"
                          fill="#00A6FF" opacity="0.9"/>
                </svg>
            </Link>

            {/* ─── Пошук ────────────────────────────── */}
            <div className="client-header__search-wrap">
                <i className="bi bi-search client-header__search-icon" />
                <input
                    type="text"
                    className="client-header__search"
                    placeholder="Виконавці, треки, подкасти..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button className="client-header__mic-btn" aria-label="Voice search">
                    <i className="bi bi-mic" />
                </button>
            </div>

            {/* ─── Праві дії ────────────────────────── */}
            <div className="client-header__actions">
                <button className="client-header__icon-btn" aria-label="Notifications">
                    <i className="bi bi-bell" />
                </button>
                <button className="client-header__avatar-btn" aria-label="Profile">
                    {user?.avatarUrl ? (
                        <img
                            src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${user.avatarUrl}`}
                            alt="Avatar"
                            className="client-header__avatar"
                        />
                    ) : (
                        <div className="client-header__avatar client-header__avatar--placeholder">
                            <i className="bi bi-person-fill" />
                        </div>
                    )}
                </button>
            </div>
        </header>
    );
};