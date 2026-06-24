'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    usePostApiAuthLogout,
    useGetApiAuthMe,
    useGetApiNotificationsUnreadCount,
    type CurrentUserDto,
    getGetApiAuthMeQueryKey,
    getGetApiNotificationsUnreadCountQueryKey,
} from '@repo/api/client.ts';
import { useSessionStore, selectIsAuthenticated } from '@/entities/session/model/store';
import { useCurrentArtistId } from '@/entities/artist/model/currentArtist';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import { SearchDropdown } from './SearchDropdown';
import { UserDropdown } from './UserDropdown';

export const Header = () => {
    const router = useRouter();
    const accessToken = useSessionStore(s => s.accessToken);
    const clearSession = useSessionStore(s => s.clearSession);

    const status = useSessionStore(s => s.status);
    const isAuthenticated = useSessionStore(selectIsAuthenticated);
    const artistId = useCurrentArtistId();

    // ─── Дані поточного користувача ───────────────────────
    const { data: meRaw, refetch } = useGetApiAuthMe({
        query: {
            queryKey: getGetApiAuthMeQueryKey(),
            enabled: !!accessToken,
            staleTime: 0,
        },
    });

    useEffect(() => {
        if (accessToken) {
            refetch();
        }
    }, [accessToken, refetch]);

    const me = (meRaw as CurrentUserDto) ?? null;
    const avatarSrc = getImageUrl(me?.profile?.avatarUrl);

    // ─── Лічильник непрочитаних ───────────────────────────
    const { data: unreadRaw } = useGetApiNotificationsUnreadCount({
        query: {
            enabled: !!accessToken,
            queryKey: getGetApiNotificationsUnreadCountQueryKey(),
        },
    });
    const unreadCount = (unreadRaw as unknown as number) ?? 0;

    // ─── Пошук ────────────────────────────────────────────
    const [query,        setQuery]        = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

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
        if (e.key === 'Escape') setShowDropdown(false);
    };

    // ─── Logout ───────────────────────────────────────────
    const { mutate: logout } = usePostApiAuthLogout({
        mutation: {
            onSettled: () => {
                clearSession();
                router.replace('/login');
            },
        },
    });

    return (
        <header className="client-header">
            {/* Лого */}
            <Link href="/home" className="client-header__logo">
                <Image src="/images/logo.svg" alt="Lumitune" width={32} height={32} />
            </Link>

            {/* Пошук */}
            <div className="client-header__search-wrap" ref={searchRef}>
                <i className="bi bi-search client-header__search-icon" />
                <input
                    type="text"
                    className="client-header__search"
                    placeholder="Виконавці, треки, плейлісти..."
                    value={query}
                    onChange={e => {
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

                {showDropdown && (
                    <SearchDropdown
                        query={query}
                        onClose={() => setShowDropdown(false)}
                    />
                )}
            </div>

            {/* Праві дії */}
            <div className="client-header__actions">
                {status === 'loading' ? (
                    null
                ) : isAuthenticated ? (
                    <div className="client-header__user">
                        {/* Premium кнопка */}
                        {!me?.isPremium && (
                            <Link href="/premium" className="client-header__premium-btn">
                                Дізнатися про Premium
                            </Link>
                        )}

                        {/* Повідомлення */}
                        <Link
                            href="/notifications"
                            className="client-header__icon-btn client-header__notif-btn"
                            aria-label="Повідомлення"
                        >
                            <img
                                src="/images/icons/bell.svg"
                                alt="Notifications"
                                width={20}
                                height={20}
                                className="client-header__notif-icon"
                            />
                            {unreadCount > 0 && (
                                <span className="client-header__notif-badge">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </Link>

                        {/* Аватар */}
                        <button
                            className="client-header__avatar-btn"
                            onClick={() => setShowUserMenu(v => !v)}
                            aria-label="Меню користувача"
                        >
                            {avatarSrc ? (
                                <img
                                    src={avatarSrc}
                                    alt={me?.profile?.firstName ?? me?.email ?? 'Avatar'}
                                    className="client-header__avatar"
                                />
                            ) : (
                                <div className="client-header__avatar client-header__avatar--placeholder">
                                    <i className="bi bi-person-fill" />
                                </div>
                            )}
                            {me?.isPremium && (
                                <span className="client-header__premium-badge">Premium</span>
                            )}
                        </button>

                        {showUserMenu && (
                            <UserDropdown
                                userId={me?.id ?? ''}
                                isPremium={me?.isPremium ?? false}
                                isArtist={!!artistId}
                                onClose={() => setShowUserMenu(false)}
                                onLogout={() => logout()}
                            />
                        )}
                    </div>
                ) : (
                    <div className="d-flex gap-2">
                        <Link href="/login" className="client-header__auth-btn client-header__auth-btn--ghost">
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