'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/widgets/layout/ui/ClientLayout';
import { GuestSidebarCard } from '@/shared/ui/GuestSidebarCard';

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

interface GuestSidebarProps {
    onResizeStart?: (e: React.MouseEvent) => void;
}

export const GuestSidebar = ({ onResizeStart }: GuestSidebarProps) => {
    const pathname = usePathname();
    const { collapsed, setCollapsed, sidebarWidth } = useSidebar();

    return (
        <>
            <aside
                className={`client-sidebar${collapsed ? ' client-sidebar--collapsed' : ''}`}
                style={{ width: collapsed ? undefined : sidebarWidth }}
            >
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
                        <GuestSidebarCard
                            title="Створи свій перший плейліст"
                            text="Це зовсім не складно! Ми допоможемо."
                            btnLabel="Створити плейліст"
                            popoverTitle="Створюй плейлісти"
                            popoverText="Щоб створювати плейлісти та ділитися ними, увійди в акаунт."
                        />

                        <GuestSidebarCard
                            title="Відкрий Premium"
                            text="Слухай без реклами та обмежень."
                            btnLabel="Дізнатися більше"
                            popoverTitle="Отримай Premium"
                            popoverText="Щоб оформити підписку, увійди в акаунт."
                        />
                    </div>

                </div>

                {/* ─── Resize handle ──────────────────────── */}
                {!collapsed && (
                    <div
                        className="client-sidebar__resize-handle"
                        onMouseDown={onResizeStart}
                    />
                )}

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