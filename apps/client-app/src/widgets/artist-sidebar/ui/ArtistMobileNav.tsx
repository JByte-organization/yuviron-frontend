'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Мобільна навігація кабінету артиста. Сайдбар (.client-sidebar) має display:none
// нижче lg (992px) — на телефоні/планшеті по студії неможливо переміщатись. Цей
// компонент дає горизонтальний скрол-таббар замість сайдбара. Показуємо лише <lg
// (клас d-lg-none), тож на десктопі він не зʼявляється і не дублює сайдбар.
//
// Список тримаємо в синхроні з ArtistDashboardSidebar (ті самі маршрути/іконки).
const ITEMS: { href: string; label: string; icon: string; exact?: boolean }[] = [
    { href: '/artist-dashboard',            label: 'Профіль',     icon: 'bi-person-circle',  exact: true },
    { href: '/artist-dashboard/tracks',     label: 'Треки',       icon: 'bi-music-note-list' },
    { href: '/artist-dashboard/albums',     label: 'Альбоми',     icon: 'bi-collection' },
    { href: '/artist-dashboard/team',       label: 'Команда',     icon: 'bi-people' },
    { href: '/artist-dashboard/analytics',  label: 'Статистика',  icon: 'bi-graph-up' },
    { href: '/artist-dashboard/finance',    label: 'Фінанси',     icon: 'bi-wallet2' },
    { href: '/artist-dashboard/settings',   label: 'Налаштування',icon: 'bi-gear' },
];

export const ArtistMobileNav = () => {
    const pathname = usePathname();
    const isActive = (href: string, exact?: boolean) =>
        exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

    return (
        <nav className="artist-mobile-nav d-lg-none" aria-label="Навігація кабінету артиста">
            <div className="artist-mobile-nav__scroll">
                {ITEMS.map((it) => (
                    <Link
                        key={it.href}
                        href={it.href}
                        aria-current={isActive(it.href, it.exact) ? 'page' : undefined}
                        className={`artist-mobile-nav__item${
                            isActive(it.href, it.exact) ? ' artist-mobile-nav__item--active' : ''
                        }`}
                    >
                        <i className={`bi ${it.icon}`} />
                        <span>{it.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
};
