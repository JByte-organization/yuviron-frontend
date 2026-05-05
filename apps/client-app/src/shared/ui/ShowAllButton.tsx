// shared/ui/ShowAllButton.tsx
import React from 'react';
import Link from 'next/link';

interface ShowAllButtonProps {
    href: string;
    label?: string;
}

export const ShowAllButton = ({ href, label = 'Все тут' }: ShowAllButtonProps) => {
    return (
        <Link href={href} className="show-all-btn">
            <div className="show-all-btn__circle">
                <i className="bi bi-plus" />
            </div>
            <span className="show-all-btn__label">{label}</span>
        </Link>
    );
};