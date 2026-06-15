'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { CreatePlaylistModal } from '@/features/playlist/create/ui/CreatePlaylistModal';

interface MobileTabProps {
    label: string;
    icon: string;
    href?: string;
    isActive?: boolean;
    onClick?: () => void;
}

const MobileTab = ({ label, icon, href, isActive, onClick }: MobileTabProps) => {
    const className = `mobile-nav__tab${isActive ? ' mobile-nav__tab--active' : ''}`;

    const content = (
        <>
            <div className="mobile-nav__icon-wrapper">
                <Image
                    src={`/images/icons/${icon}.svg`}
                    alt={label}
                    width={20}
                    height={20}
                    className="mobile-nav__icon"
                />
            </div>
            <span className="mobile-nav__label">{label}</span>
        </>
    );

    if (href) {
        return (
            <Link href={href} className={className}>
                {content}
            </Link>
        );
    }

    return (
        <button type="button" className={className} onClick={onClick}>
            {content}
        </button>
    );
};

export const MobileNavigation = () => {
    const pathname = usePathname();
    const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);

    const isActive = (href: string) => pathname === href;

    return (
        <>
            <div className="mobile-nav d-flex d-lg-none">
                <div className="mobile-nav__inner w-100 d-flex justify-content-around align-items-center">
                    <MobileTab
                        label="Головна"
                        icon="home"
                        href="/home"
                        isActive={isActive('/home')}
                    />

                    <MobileTab
                        label="Медіатека"
                        icon="library"
                        href="/library"
                        isActive={isActive('/library')}
                    />

                    <MobileTab
                        label="Улюблені"
                        icon="heart"
                        href="/favorites"
                        isActive={isActive('/favorites')}
                    />

                    <MobileTab
                        label="Створити"
                        icon="plus-square"
                        onClick={() => setCreatePlaylistOpen(true)}
                    />
                </div>
            </div>

            {/* Модальне вікно створення нового плейліста */}
            <CreatePlaylistModal
                isOpen={createPlaylistOpen}
                onClose={() => setCreatePlaylistOpen(false)}
                onSuccess={() => setCreatePlaylistOpen(false)}
            />
        </>
    );
};