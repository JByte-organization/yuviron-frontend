'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/shared/lib/ThemeProvider';
import { SearchDropdown } from './SearchDropdown';
import { UserDropdown } from './UserDropdown';

interface HeaderUser {
    id: string;
    name?: string;
    avatarUrl?: string | null;
    isPremium?: boolean;
    isArtist?: boolean;
    artistId?: string;
}

interface HeaderProps {
    /** TODO: передавати з хука useGetApiCurrentUser() */
    user?: HeaderUser | null;
    /** Кількість непрочитаних повідомлень */
    unreadCount?: number;
}

export const Header = ({ user, unreadCount = 0 }: HeaderProps) => {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    const [query, setQuery]               = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchResults]                 = useState([]);  // TODO: useGetApiSearch
    const [isSearchLoading]               = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);

    // Закрити дропдаун пошуку при кліку поза
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim()) {
            setShowDropdown(false);
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
        if (e.key === 'Escape') {
            setShowDropdown(false);
        }
    };

    const handleLogout = () => {
        // TODO: викликати usePostApiAuthLogout()
        console.log('logout');
    };

    return (
        <header className="client-header">

            {/* ─── Лого ─────────────────────────────── */}
            <Link href="/home" className="client-header__logo">
                <img
                    src="/images/logo.svg"
                    alt="Lumitune"
                    width={32}
                    height={32}
                />
            </Link>

            {/* ─── Пошук (по центру) ────────────────── */}
            <div className="client-header__search-wrap" ref={searchRef}>
                <i className="bi bi-search client-header__search-icon" />
                <input
                    type="text"
                    className="client-header__search"
                    placeholder="Виконавці, треки, подкасти..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowDropdown(e.target.value.length > 0);
                    }}
                    onKeyDown={handleSearchKeyDown}
                    onFocus={() => query && setShowDropdown(true)}
                />
                {query && (
                    <button
                        className="client-header__search-clear"
                        onClick={() => { setQuery(''); setShowDropdown(false); }}
                        aria-label="Очистити"
                    >
                        <i className="bi bi-x" />
                    </button>
                )}
                <button className="client-header__mic-btn" aria-label="Voice search">
                    <i className="bi bi-mic" />
                </button>

                {/* Дропдаун результатів */}
                {showDropdown && (
                    <SearchDropdown
                        query={query}
                        results={searchResults}
                        isLoading={isSearchLoading}
                        onClose={() => setShowDropdown(false)}
                    />
                )}
            </div>

            {/* ─── Праві дії ────────────────────────── */}
            <div className="client-header__actions">

                {/* Premium кнопка — тільки без преміуму */}
                {user && !user.isPremium && (
                    <Link href="/premium" className="client-header__premium-btn">
                        Дізнатися про Premium
                    </Link>
                )}

                {/* Перемикач теми */}
                <button
                    className="client-header__icon-btn client-header__theme-btn"
                    onClick={toggleTheme}
                    aria-label={theme === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
                    title={theme === 'dark' ? 'Світла тема' : 'Темна тема'}
                >
                    {theme === 'dark' ? (
                        // Іконка сонця
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
                            <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
                                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    ) : (
                        // Іконка місяця
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                                  stroke="currentColor" strokeWidth="2"
                                  strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    )}
                </button>

                {/* Повідомлення */}
                <Link
                    href="/notifications"
                    className="client-header__icon-btn client-header__notif-btn"
                    aria-label="Повідомлення"
                >
                    {/* TODO: замінити на свою SVG іконку */}
                    <img
                        src="/images/icons/bell.svg"
                        alt="Notifications"
                        width={20}
                        height={20}
                        className="client-header__notif-icon"
                    />
                    {/* Каунтер — тільки якщо є непрочитані */}
                    {unreadCount > 0 && (
                        <span className="client-header__notif-badge">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Link>

                {/* Аватар + дропдаун */}
                {user ? (
                    <div className="client-header__user">
                        <button
                            className="client-header__avatar-btn"
                            onClick={() => setShowUserMenu((v) => !v)}
                            aria-label="Меню користувача"
                        >
                            {user.avatarUrl ? (
                                <img
                                    src={`${process.env.NEXT_PUBLIC_STORAGE_URL}/${user.avatarUrl}`}
                                    alt={user.name ?? 'Avatar'}
                                    className="client-header__avatar"
                                />
                            ) : (
                                <div className="client-header__avatar client-header__avatar--placeholder">
                                    <i className="bi bi-person-fill" />
                                </div>
                            )}

                            {/* Premium badge */}
                            {user.isPremium && (
                                <span className="client-header__premium-badge">Premium</span>
                            )}
                        </button>

                        {showUserMenu && (
                            <UserDropdown
                                userId={user.id}
                                isPremium={user.isPremium}
                                isArtist={user.isArtist}
                                artistId={user.artistId}
                                onClose={() => setShowUserMenu(false)}
                                onLogout={handleLogout}
                            />
                        )}
                    </div>
                ) : (
                    /* Незареєстрований */
                    <div className="d-flex gap-2">
                        <Link href="/login"    className="client-header__auth-btn client-header__auth-btn--ghost">
                            Увійти
                        </Link>
                        <Link href="/register" className="client-header__auth-btn client-header__auth-btn--primary">
                            Реєстрація
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};