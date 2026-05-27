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

    return (
        <div
            className={`mood-card${isActive ? ' mood-card--active' : ''}`}
            onClick={() => onClick?.(mood.id)}
        >
            {/* circle-wrap центрує коло в Bootstrap-колонці */}
            <div className="mood-card__circle-wrap">
                <div className="mood-card__circle">
                    <div className="mood-card__circle-inner">
                        {mood.iconUrl ? (
                            <Image
                                src={mood.iconUrl}
                                alt={mood.name}
                                width={150}
                                height={150}
                                className="mood-card__icon"
                            />
                        ) : (
                            <i className="bi bi-music-note mood-card__icon-placeholder" />
                        )}
                    </div>
                </div>
            </div>
            <span className="mood-card__name">{mood.name}</span>
        </div>
    );
};