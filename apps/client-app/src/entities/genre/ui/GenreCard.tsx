import React from 'react';
import Link from 'next/link';
import type { GenreCardData } from '../model/types';

interface GenreCardProps {
    genre: GenreCardData;
}

export const GenreCard = ({ genre }: GenreCardProps) => {
    const coverSrc = genre.coverUrl
        ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${genre.coverUrl}`
        : `https://picsum.photos/seed/genre-${genre.id}/200/200`;

    return (
        <Link href={`/genres/${genre.id}`} className="genre-card">
            <div className="genre-card__bg" style={{ background: genre.color ?? '#1E3A5F' }}>
                <img src={coverSrc} alt={genre.name} className="genre-card__cover" />
            </div>
            <span className="genre-card__name">{genre.name}</span>
        </Link>
    );
};