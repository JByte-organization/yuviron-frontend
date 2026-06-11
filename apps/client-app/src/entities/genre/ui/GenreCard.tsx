import React from 'react';
import Link from 'next/link';
import type { GenreCardData } from '../model/types';

interface GenreCardProps {
    genre: GenreCardData;
}

export const GenreCard = ({ genre }: GenreCardProps) => {

    return (
        <Link href={`/genres/${genre.id}`} className="genre-card">
            <div className="genre-card__bg" style={{ background: genre.color ?? '#1E3A5F' }}>
                {genre.coverUrl ? (
                <img
                    src={genre.coverUrl}
                    width={150}
                    height={150}
                    alt={genre.name}
                    className="genre-card__cover"
                />
                ) : (
                    <i className="bi bi-music-note mood-card__icon-placeholder" />
                )}
            </div>
            <span className="genre-card__name">{genre.name}</span>
        </Link>
    );
};