'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

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
export interface GuestSidebarCardProps {
    title: string;
    text: string;
    btnLabel: string;
    popoverTitle: string;
    popoverText: string;
}

export const GuestSidebarCard = ({
                                     title,
                                     text,
                                     btnLabel,
                                     popoverTitle,
                                     popoverText,
                                 }: GuestSidebarCardProps) => {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

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