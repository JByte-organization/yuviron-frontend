'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { GuestSidebarCard } from '@/shared/ui/Cards/GuestSidebarCard/GuestSidebarCard.tsx';

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

export const GuestSidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="client-sidebar client-sidebar--guest">
            <div className="client-sidebar__inner">

                {/* Navigation */}
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

                {/* CTA cards */}
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
        </aside>
    );
};