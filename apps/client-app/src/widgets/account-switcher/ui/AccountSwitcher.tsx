'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import {
    getGetApiAuthMeQueryKey,
    useGetApiAuthMe,
    type CurrentUserDto,
} from '@repo/api/client.ts';
import {
    useSessionStore,
    selectIsAuthenticated,
} from '@/entities/session/model/store';
import { useCurrentArtist, setStoredArtistId } from '@/entities/artist/model/currentArtist';
import { useManagedArtists } from '@/entities/artist/model/managedArtists';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import { unwrap } from '@/shared/lib/unwrapApi';
import { PremiumGateModal } from './PremiumGateModal';

const ROLE_LABEL: Record<string, string> = {
    Owner: 'Власник',
    Manager: 'Менеджер',
    Editor: 'Редактор',
    Viewer: 'Перегляд',
};
const roleLabel = (role?: string | null): string | null =>
    role ? ROLE_LABEL[role] ?? role : null;

const Avatar = ({ src, fallbackIcon }: { src: string | null; fallbackIcon: string }) =>
    src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="account-switcher__avatar" />
    ) : (
        <div className="account-switcher__avatar account-switcher__avatar--placeholder">
            <i className={`bi ${fallbackIcon}`} />
        </div>
    );

export const AccountSwitcher = ({ collapsed = false }: { collapsed?: boolean }) => {
    const router = useRouter();
    const pathname = usePathname();
    const isAuthenticated = useSessionStore(selectIsAuthenticated);
    const hasToken = useSessionStore((s) => !!s.accessToken);
    const userId = useSessionStore((s) => s.user?.id);

    const { artists } = useManagedArtists();
    const { artistId: selectedArtistId } = useCurrentArtist();

    const { data: meRaw } = useGetApiAuthMe({
        query: { enabled: hasToken, queryKey: getGetApiAuthMeQueryKey() },
    });
    const me = unwrap<CurrentUserDto>(meRaw);

    const [open, setOpen] = useState(false);
    const [showPremium, setShowPremium] = useState(false);

    const triggerRef = useRef<HTMLButtonElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 280 });

    // 🌟 ФІКС: Динамічний перерахунок координат відносно в'юпорту при скролі та ресайзі
    useEffect(() => {
        const updateCoordinates = () => {
            if (open && triggerRef.current) {
                const rect = triggerRef.current.getBoundingClientRect();
                setCoords({
                    top: rect.bottom + 10, // 10px відступ прямо під кнопкою тригера
                    left: rect.left,
                    width: Math.max(rect.width, 280),
                });
            }
        };

        if (open) {
            updateCoordinates();

            window.addEventListener('resize', updateCoordinates);
            // capture: true відстежує скрол у будь-якому елементі (навіть усередині сайдбара)
            window.addEventListener('scroll', updateCoordinates, { capture: true });
        }

        return () => {
            window.removeEventListener('resize', updateCoordinates);
            window.removeEventListener('scroll', updateCoordinates, { capture: true });
        };
    }, [open, collapsed]);

    if (!isAuthenticated) return null;

    const isInCabinet = pathname?.startsWith('/artist-dashboard') ?? false;
    const activeArtist = isInCabinet
        ? artists.find((a) => a.artistId === selectedArtistId) ?? null
        : null;

    const personalName = me?.profile?.firstName?.trim() || me?.email || 'Мій акаунт';
    const personalAvatar = getImageUrl(me?.profile?.avatarUrl);

    const close = () => setOpen(false);

    const goPersonal = () => {
        close();
        router.push('/home');
    };

    const goArtist = (artistId: string) => {
        close();
        if (!artists.some((a) => a.artistId === artistId)) return;
        setStoredArtistId(userId, artistId);
        router.push('/artist-dashboard');
    };

    const addAccount = () => {
        close();
        if (me?.isPremium) router.push('/become-artist');
        else setShowPremium(true);
    };

    const triggerName = activeArtist ? (activeArtist.name ?? 'Артист') : personalName;
    const triggerAvatar = activeArtist ? getImageUrl(activeArtist.avatarUrl) : personalAvatar;
    const triggerSub = activeArtist ? roleLabel(activeArtist.role) ?? 'Кабінет артиста' : 'Особистий профіль';

    return (
        <div className={`account-switcher account-switcher--sidebar${collapsed ? ' account-switcher--collapsed' : ''}`}>
            <button
                ref={triggerRef}
                type="button"
                className="account-switcher__trigger"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                title={collapsed ? triggerName : undefined}
            >
                <Avatar src={triggerAvatar} fallbackIcon={activeArtist ? 'bi-music-note-beamed' : 'bi-person-fill'} />
                <span className="account-switcher__trigger-text">
                    <span className="account-switcher__trigger-name">{triggerName}</span>
                    <span className="account-switcher__trigger-sub">{triggerSub}</span>
                </span>
                <i className={`bi bi-chevron-down account-switcher__chevron${open ? ' account-switcher__chevron--up' : ''}`} />
            </button>

            {open && createPortal(
                <>
                    <div
                        className="account-switcher__overlay"
                        onClick={close}
                        style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'transparent' }}
                    />

                    <div
                        className="account-switcher__menu show"
                        role="menu"
                        style={{
                            position: 'fixed', // Залишаємо фіксованим, координати тепер вираховуються ідеально
                            top: `${coords.top}px`,
                            left: `${coords.left}px`,
                            width: `${coords.width}px`,
                            margin: 0,
                            zIndex: 9999,
                            display: 'block'
                        }}
                    >
                        <div className="account-switcher__label">Облікові записи</div>

                        <button
                            type="button"
                            className={`account-switcher__item${!isInCabinet ? ' account-switcher__item--active' : ''}`}
                            onClick={goPersonal}
                            role="menuitem"
                        >
                            <Avatar src={personalAvatar} fallbackIcon="bi-person-fill" />
                            <span className="account-switcher__item-text">
                                <span className="account-switcher__item-name">{personalName}</span>
                                <span className="account-switcher__item-sub">Особистий профіль</span>
                            </span>
                            {!isInCabinet && <i className="bi bi-check2 account-switcher__check" />}
                        </button>

                        {artists.map((a) => {
                            const active = isInCabinet && a.artistId === selectedArtistId;
                            return (
                                <button
                                    key={a.artistId}
                                    type="button"
                                    className={`account-switcher__item${active ? ' account-switcher__item--active' : ''}`}
                                    onClick={() => goArtist(a.artistId!)}
                                    role="menuitem"
                                >
                                    <Avatar src={getImageUrl(a.avatarUrl)} fallbackIcon="bi-music-note-beamed" />
                                    <span className="account-switcher__item-text">
                                        <span className="account-switcher__item-name">{a.name ?? 'Артист'}</span>
                                        <span className="account-switcher__item-sub">
                                            {roleLabel(a.role) ?? 'Кабінет артиста'}
                                        </span>
                                    </span>
                                    {active && <i className="bi bi-check2 account-switcher__check" />}
                                </button>
                            );
                        })}

                        <div className="account-switcher__divider" />

                        <button
                            type="button"
                            className="account-switcher__item account-switcher__item--add"
                            onClick={addAccount}
                            role="menuitem"
                        >
                            <span className="account-switcher__avatar account-switcher__avatar--add">
                                <i className="bi bi-plus-lg" />
                            </span>
                            <span className="account-switcher__item-text">
                                <span className="account-switcher__item-name">Додати акаунт</span>
                                <span className="account-switcher__item-sub">Кабінет артиста</span>
                            </span>
                        </button>
                    </div>
                </>,
                document.body
            )}

            <PremiumGateModal isOpen={showPremium} onClose={() => setShowPremium(false)} />
        </div>
    );
};