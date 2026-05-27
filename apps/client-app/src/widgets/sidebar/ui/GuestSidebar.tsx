'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/widgets/layout/ui/ClientLayout';

interface NavItemProps {
    label: string;
    icon: string;
    href: string;
    isActive?: boolean;
}

const NavItem = ({ label, icon, href, isActive }: NavItemProps) => (
    <Link
        href={href}
        className={`client-sidebar__nav-item${isActive ? ' client-sidebar__nav-item--active' : ''}`}
    >
        <span className="client-sidebar__nav-icon">
            <Image src={`/images/icons/${icon}.svg`} alt={label} width={18} height={18} />
        </span>
        <span className="client-sidebar__nav-label">{label}</span>
    </Link>
);

// ══════════════════════════════════════════════════════════
// AUTH POPOVER
// ══════════════════════════════════════════════════════════
interface AuthPopoverProps {
    title: string;
    text: string;
    isOpen: boolean;
    onClose: () => void;
}

const AuthPopover = ({ title, text, isOpen, onClose }: AuthPopoverProps) => {
    if (!isOpen) return null;

    return (
        <div className="guest-auth-popover">
            <p className="guest-auth-popover__title">{title}</p>
            <p className="guest-auth-popover__text">{text}</p>
            <div className="guest-auth-popover__actions">
                <button
                    className="guest-auth-popover__btn guest-auth-popover__btn--ghost"
                    onClick={onClose}
                >
                    Не зараз
                </button>
                <Link
                    href="/login"
                    className="guest-auth-popover__btn guest-auth-popover__btn--primary"
                    onClick={onClose}
                >
                    Увійти
                </Link>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════
// GUEST SIDEBAR CARD
// ══════════════════════════════════════════════════════════
interface GuestCardProps {
    title: string;
    text: string;
    btnLabel: string;
    popoverTitle: string;
    popoverText: string;
}

const GuestCard = ({ title, text, btnLabel, popoverTitle, popoverText }: GuestCardProps) => {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Закрити при кліку поза карткою
    useEffect(() => {
        if (!popoverOpen) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setPopoverOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [popoverOpen]);

    return (
        <div className="guest-sidebar-card" ref={ref}>
            <p className="guest-sidebar-card__title">{title}</p>
            <p className="guest-sidebar-card__text">{text}</p>
            <button
                className="guest-sidebar-card__btn"
                onClick={() => setPopoverOpen(v => !v)}
            >
                {btnLabel}
            </button>

            <AuthPopover
                title={popoverTitle}
                text={popoverText}
                isOpen={popoverOpen}
                onClose={() => setPopoverOpen(false)}
            />
        </div>
    );
};

// ══════════════════════════════════════════════════════════
// GUEST SIDEBAR
// ══════════════════════════════════════════════════════════
export const GuestSidebar = () => {
    const pathname = usePathname();
    const { collapsed, setCollapsed } = useSidebar();

    return (
        <>
            <aside className={`client-sidebar${collapsed ? ' client-sidebar--collapsed' : ''}`}>
                <div className="client-sidebar__inner">

                    {/* Навігація */}
                    <div className="client-sidebar__section">
                        <nav className="client-sidebar__nav">
                            <NavItem
                                href="/home"
                                icon="home"
                                label="Головна"
                                isActive={pathname === '/home'}
                            />
                        </nav>
                    </div>

                    {/* CTA картки */}
                    <div className="client-sidebar__section">
                        <GuestCard
                            title="Створи свій перший плейліст"
                            text="Це зовсім не складно! Ми допоможемо."
                            btnLabel="Створити плейліст"
                            popoverTitle="Створюй плейлісти"
                            popoverText="Щоб створювати плейлісти та ділитися ними, увійди в акаунт."
                        />

                        <GuestCard
                            title="Відкрий Premium"
                            text="Слухай без реклами та обмежень."
                            btnLabel="Дізнатися більше"
                            popoverTitle="Отримай Premium"
                            popoverText="Щоб оформити підписку, увійди в акаунт."
                        />
                    </div>

                </div>

                <button
                    className="client-sidebar__toggle"
                    onClick={() => setCollapsed(true)}
                    aria-label="Сховати сайдбар"
                >
                    <Image src="/images/icons/chevron-left.svg" alt="collapse" width={14} height={14} />
                </button>
            </aside>

            {collapsed && (
                <button
                    className="client-sidebar__restore-btn"
                    onClick={() => setCollapsed(false)}
                    aria-label="Показати сайдбар"
                >
                    <Image src="/images/icons/chevron-right.svg" alt="open" width={14} height={14} />
                </button>
            )}
        </>
    );
};