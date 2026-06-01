'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperClass } from 'swiper/types';

import 'swiper/css';

import {
    useGetApiAuthMe,
    useGetApiMePlaylists,
    useGetApiUsersIdFollowers,
    useGetApiUsersIdFollowing,
    // ФІКС: Імпортуємо автогенеровані хелпери ключів для React Query
    getGetApiMePlaylistsQueryKey,
    getGetApiUsersIdFollowersQueryKey,
    getGetApiUsersIdFollowingQueryKey,
    type UserPlaylistDto,
    type FollowerDto,
    type FollowedProfileDto,
} from '@repo/api';
import { UserPageHeader } from './UserPageHeader';
import { UserCard, type UserCardData } from '@/entities/user/ui/UserCard';
import { PlaylistCard, type PlaylistCardData } from '@/entities/playlist/ui/PlaylistCard';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { EditProfileModal } from '@/features/user/ui/EditProfileModal';
import { getImageUrl } from '@/shared/lib/getImageUrl';

// ══════════════════════════════════════════════════════════
// ТИПІЗАЦІЯ СТРУКТУРИ СЕРВЕРА
// ══════════════════════════════════════════════════════════

interface UserMeResponse {
    id: string;
    email: string;
    isPremium: boolean;
    profile?: {
        firstName?: string | null;
        avatarUrl?: string | null;
        bannerUrl?: string | null;
        bio?: string | null;
        city?: string | null;
        country?: string | null;
    } | null;
    followersCount?: number;
    followingCount?: number;
}

interface ExtendedPlaylistCardData extends PlaylistCardData {
    isPublic: boolean;
}

// ══════════════════════════════════════════════════════════
// ЧИСТІ МАППЕРИ ДАННИХ
// ══════════════════════════════════════════════════════════

const mapPlaylist = (p: UserPlaylistDto): ExtendedPlaylistCardData => {
    // ФІКС ПОМИЛКИ TS2430: Робимо безпечний інлайн-каст властивості без any
    const rawVisibility = (p as { visibility?: string }).visibility;

    return {
        id:          p.id          ?? '',
        name:        p.title       ?? '',
        tracksCount: p.tracksCount ?? undefined,
        coverUrl:    p.coverUrl    ?? null,
        isPublic:    rawVisibility === 'Public',
    };
};

const mapFollower = (f: FollowerDto): UserCardData => ({
    id:        f.id        ?? '',
    name:      f.name      ?? '',
    avatarUrl: f.avatarUrl ?? null,
    isArtist:  false,
});

const mapFollowing = (f: FollowedProfileDto): UserCardData => ({
    id:        f.id        ?? '',
    name:      f.name      ?? '',
    avatarUrl: f.avatarUrl ?? null,
    isArtist:  f.type === 'Artist',
    artistId:  f.type === 'Artist' ? f.id : undefined,
});

const extractPlaylists = (response: unknown): UserPlaylistDto[] => {
    if (!response || typeof response !== 'object') return [];
    if (Array.isArray(response)) return response as UserPlaylistDto[];
    const resObj = response as Record<string, unknown>;
    if ('items' in resObj && Array.isArray(resObj.items)) return resObj.items as UserPlaylistDto[];
    if ('data' in resObj && Array.isArray(resObj.data)) return resObj.data as UserPlaylistDto[];
    return [];
};

// ══════════════════════════════════════════════════════════
// КОМПОНЕНТ СТРАНИЦІ
// ══════════════════════════════════════════════════════════

export const MyProfilePage = () => {
    const router = useRouter();
    const [showEditProfile, setShowEditProfile] = useState(false);

    const [instantAvatarUrl, setInstantAvatarUrl] = useState<string | null | undefined>(undefined);

    const [publicSwiperInstance, setPublicSwiperInstance] = useState<SwiperClass | null>(null);
    const [privateSwiperInstance, setPrivateSwiperInstance] = useState<SwiperClass | null>(null);

    const [showPublicArrows, setShowPublicArrows] = useState(false);
    const [showPrivateArrows, setShowPrivateArrows] = useState(false);

    // ── 1. Запити до API ──────────────────────────────────
    const { data: meRaw, isLoading: meLoading, refetch: refetchMe } = useGetApiAuthMe();
    const me = meRaw as unknown as UserMeResponse | undefined;
    const userId = me?.id;

    useEffect(() => {
        if (!userId) return;

        const cacheRaw = localStorage.getItem(`yuviron_temp_avatar_${userId}`);
        if (cacheRaw) {
            try {
                const cache = JSON.parse(cacheRaw);
                if (cache.expiresAt > Date.now()) {
                    if (me?.profile?.avatarUrl) {
                        localStorage.removeItem(`yuviron_temp_avatar_${userId}`);
                    } else {
                        requestAnimationFrame(() => {
                            setInstantAvatarUrl(cache.url);
                        });
                    }
                } else {
                    localStorage.removeItem(`yuviron_temp_avatar_${userId}`);
                }
            } catch {
                localStorage.removeItem(`yuviron_temp_avatar_${userId}`);
            }
        }
    }, [userId, me?.profile?.avatarUrl]);

    // ФІКС ПОМИЛКИ TS2741: Передаємо правильний згенерований queryKey
    const { data: playlistsResponse, isLoading: playlistsLoading } = useGetApiMePlaylists(
        { PageSize: 50 },
        {
            query: {
                enabled: !!userId,
                queryKey: getGetApiMePlaylistsQueryKey({ PageSize: 50 })
            }
        }
    );

    // ФІКС ПОМИЛКИ TS2741: Передаємо правильний згенерований queryKey для підписників
    const { data: followersRaw } = useGetApiUsersIdFollowers(
        userId ?? '',
        { PageSize: 20 },
        {
            query: {
                enabled: !!userId,
                queryKey: getGetApiUsersIdFollowersQueryKey(userId ?? '', { PageSize: 20 })
            }
        }
    );

    // ФІКС ПОМИЛКИ TS2741: Передаємо правильний згенерований queryKey для підписок
    const { data: followingRaw } = useGetApiUsersIdFollowing(
        userId ?? '',
        { PageSize: 20 },
        {
            query: {
                enabled: !!userId,
                queryKey: getGetApiUsersIdFollowingQueryKey(userId ?? '', { PageSize: 20 })
            }
        }
    );

    // ── 2. Мемоізація та обробка списків ──────────────────
    const userDisplayName = useMemo(() => {
        return me?.profile?.firstName || 'Користувач';
    }, [me]);

    const userAvatarUrl = useMemo(() => {
        if (instantAvatarUrl !== undefined) return instantAvatarUrl;
        return me?.profile?.avatarUrl ? getImageUrl(me.profile.avatarUrl) : null;
    }, [me, instantAvatarUrl]);

    const rawPlaylists = extractPlaylists(playlistsResponse);
    const allPlaylists = rawPlaylists.map(mapPlaylist);

    const publicPlaylists  = allPlaylists.filter((p) => p.isPublic);
    const privatePlaylists = allPlaylists.filter((p) => !p.isPublic);

    const followers = ((followersRaw as Record<string, unknown> | undefined)?.items as FollowerDto[] ?? []).map(mapFollower);
    const following = ((followingRaw as Record<string, unknown> | undefined)?.items as FollowedProfileDto[] ?? []).map(mapFollowing);

    const swiperBreakpoints = {
        320: { slidesPerView: 2, spaceBetween: 12 },
        768: { slidesPerView: 4, spaceBetween: 16 },
        1200: { slidesPerView: 6, spaceBetween: 16 }
    };

    if (meLoading || playlistsLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <div className="spinner-border text-light" role="status" />
            </div>
        );
    }

    if (!me) {
        return <div className="text-center text-secondary mt-5">Не вдалося завантажити профіль</div>;
    }

    return (
        <div className="user-page">
            <UserPageHeader
                userId={me.id}
                name={userDisplayName}
                avatarUrl={userAvatarUrl}
                playlistsCount={allPlaylists.length}
                followersCount={me.followersCount ?? 0}
                followingCount={me.followingCount ?? 0}
                isOwner={true}
                onEdit={() => setShowEditProfile(true)}
                onShare={() => navigator.clipboard.writeText(window.location.origin + `/users/${me.id}`)}
            />

            {/* Відкриті */}
            {publicPlaylists.length > 0 && (
                <section className="user-page__section mb-5">
                    <SectionHeader
                        title="Мої відкриті плейлісти"
                        onPrev={showPublicArrows ? () => publicSwiperInstance?.slidePrev() : undefined}
                        onNext={showPublicArrows ? () => publicSwiperInstance?.slideNext() : undefined}
                    />
                    <div className="section-slider-wrap">
                        <Swiper
                            modules={[Navigation]}
                            onSwiper={(swiper) => {
                                setPublicSwiperInstance(swiper);
                                setShowPublicArrows(!swiper.isLocked);
                            }}
                            onUpdate={(swiper) => {
                                setShowPublicArrows(!swiper.isLocked);
                            }}
                            breakpoints={swiperBreakpoints}
                            className="user-slider"
                        >
                            {publicPlaylists.map((pl) => (
                                <SwiperSlide key={pl.id}>
                                    <PlaylistCard playlist={pl} onClick={(id) => router.push(`/playlist/${id}`)} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </section>
            )}

            {/* Приватні */}
            {privatePlaylists.length > 0 && (
                <section className="user-page__section mb-5">
                    <SectionHeader
                        title="Мої приватні плейлісти"
                        onPrev={showPrivateArrows ? () => privateSwiperInstance?.slidePrev() : undefined}
                        onNext={showPrivateArrows ? () => privateSwiperInstance?.slideNext() : undefined}
                    />
                    <div className="section-slider-wrap">
                        <Swiper
                            modules={[Navigation]}
                            onSwiper={(swiper) => {
                                setPrivateSwiperInstance(swiper);
                                setShowPrivateArrows(!swiper.isLocked);
                            }}
                            onUpdate={(swiper) => {
                                setShowPrivateArrows(!swiper.isLocked);
                            }}
                            breakpoints={swiperBreakpoints}
                            className="user-slider"
                        >
                            {privatePlaylists.map((pl) => (
                                <SwiperSlide key={pl.id}>
                                    <PlaylistCard playlist={pl} onClick={(id) => router.push(`/playlist/${id}`)} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </section>
            )}

            {/* Підписники */}
            {followers.length > 0 && (
                <section className="user-page__section mb-5" id="followers">
                    <SectionHeader title="Підписники" />
                    <div className="row g-3">
                        {followers.map((u) => (
                            <div key={u.id} className="col-6 col-sm-4 col-md-3 col-lg-2">
                                <UserCard user={u} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Підписки */}
            {following.length > 0 && (
                <section className="user-page__section mb-5" id="following">
                    <SectionHeader title="Підписки" />
                    <div className="row g-3">
                        {following.map((u) => (
                            <div key={u.id} className="col-6 col-sm-4 col-md-3 col-lg-2">
                                <UserCard user={u} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <EditProfileModal
                isOpen={showEditProfile}
                onClose={() => setShowEditProfile(false)}
                userId={me.id}
                onSuccess={(localUrl) => {
                    refetchMe();
                    setInstantAvatarUrl(localUrl);
                }}
                user={{
                    name:      userDisplayName,
                    avatarUrl: userAvatarUrl,
                }}
            />
        </div>
    );
};