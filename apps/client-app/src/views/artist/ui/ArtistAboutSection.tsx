import React from 'react';

interface ArtistAboutSectionProps {
    artistId: string;
    monthlyListeners?: number;
    bio?: string | null;
    bannerUrl?: string | null;
}

const formatListeners = (count?: number): string => {
    if (!count) return '';
    return count.toLocaleString('uk-UA') + ' слухачів за місяць';
};

/**
 * Секція: "Про виконавця"
 * Банер + кількість слухачів + текст біо
 *
 * Підключення даних — з useGetApiArtistsId(artistId):
 * bannerUrl, monthlyListeners, bio
 */
export const ArtistAboutSection = ({
                                       artistId,
                                       monthlyListeners,
                                       bio,
                                       bannerUrl,
                                   }: ArtistAboutSectionProps) => {
    const bannerSrc = bannerUrl
        ? `${process.env.NEXT_PUBLIC_STORAGE_URL}/${bannerUrl}`
        : `https://picsum.photos/seed/banner-${artistId}/800/400`;

    return (
        <section className="artist-about mb-5">
            <h2 className="section-header__title mb-3">Про виконавця</h2>

            <div className="artist-about__card">
                {/* Банер */}
                <div className="artist-about__banner">
                    <img src={bannerSrc} alt="About" />

                    {/* Overlay з інфо */}
                    <div className="artist-about__overlay">
                        {monthlyListeners && (
                            <p className="artist-about__listeners">
                                {formatListeners(monthlyListeners)}
                            </p>
                        )}
                        {bio && (
                            <p className="artist-about__bio">{bio}</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};