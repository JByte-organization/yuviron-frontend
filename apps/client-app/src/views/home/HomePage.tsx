import React from 'react';
import { HeroBannerSection } from './ui/sections/HeroBannerSection';
import { MoodSection } from './ui/sections/MoodSection';
import { TopTracksSection } from './ui/sections/TopTracksSection';
import { NewReleasesSection } from './ui/sections/NewReleasesSection';
import { FavoriteArtistsSection } from './ui/sections/FavoriteArtistsSection';

/**
 * Головна сторінка.
 * Щоб підключити реальні дані — передай props у відповідну секцію.
 * Приклад:
 *   const { data, isLoading } = useGetApiHomeBanners();
 *   <HeroBannerSection items={data?.items} isLoading={isLoading} />
 */
export const HomePage = () => {
    return (
        <div className="home-page">
            {/*<HeroBannerSection />*/}
            <MoodSection />
            <TopTracksSection />
            <NewReleasesSection />
            <FavoriteArtistsSection />
        </div>
    );
};