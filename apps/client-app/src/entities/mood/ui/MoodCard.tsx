import React from 'react';
import Image from 'next/image';

export interface MoodCardData {
    id: string;
    name: string;
    iconUrl?: string | null;
}

interface MoodCardProps {
    mood: MoodCardData;
    isActive?: boolean;
    onClick?: (id: string) => void;
}

export const MoodCard = ({ mood, isActive = false, onClick }: MoodCardProps) => {
    const iconSrc = mood.iconUrl
        ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${mood.iconUrl}`
        : null;

    return (
        <div
            className={`mood-card${isActive ? ' mood-card--active' : ''}`}
            onClick={() => onClick?.(mood.id)}
        >
            {/* circle-wrap центрує коло в Bootstrap-колонці */}
            <div className="mood-card__circle-wrap">
                <div className="mood-card__circle">
                    <div className="mood-card__circle-inner">
                        {iconSrc && (
                            <Image
                                src={iconSrc}
                                alt={mood.name}
                                width={52}
                                height={52}
                                className="mood-card__icon"
                            />
                        )}
                    </div>
                </div>
            </div>
            <span className="mood-card__name">{mood.name}</span>
        </div>
    );
};