'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// Імпортуємо Swiper та його модулі
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperClass } from 'swiper/types';

// Імпортуємо базові стилі Swiper
import 'swiper/css';

import {
    useGetApiUsersId,
    useGetApiUsersIdPlaylists,
    useGetApiUsersIdFollowers,
    useGetApiUsersIdFollowing,
    usePostApiUsersIdFollow,
    useDeleteApiUsersIdFollow,
    type UserProfileDto,
    type UserPlaylistDto,
    type FollowerDto,
    type FollowedProfileDto,
} from '@repo/api';
import { UserPageHeader } from './UserPageHeader';
import { UserCard, type UserCardData } from '@/entities/user/ui/UserCard';
import { PlaylistCard, type PlaylistCardData } from '@/entities/playlist/ui/PlaylistCard';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { getImageUrl } from '@/shared/lib/getImageUrl';

// ══════════════════════════════════════════════════════════
// ЧИСТІ МАППЕРІ ДАННИХ (Поза компонентом для чистоти пам'яті)
// ══════════════════════════════════════════════════════════

const mapPlaylist = (p: UserPlaylistDto): PlaylistCardData => ({
    id:          p.id          ?? '',
    name:        p.title       ?? '',
    tracksCount: p.tracksCount ?? undefined,
    coverUrl:    p.coverUrl    ?? null,
});

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

interface UserProfilePageProps {
    userId: string;
}

// ══════════════════════════════════════════════════════════
// КОМПОНЕНТ СТРАНИЦІ
// ══════════════════════════════════════════════════════════

export const UserProfilePage = ({ userId }: UserProfilePageProps) => {
    const router = useRouter();

    // Інстанс Swiper та стейт для приховування/відображення стрілок
    const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(null);
    const [showArrows, setShowArrows] = useState(false);

    // ── 1. Запити даних ───────────────────────────────────
    const { data: userRaw, isLoading: userLoading, refetch: refetchUser } = useGetApiUsersId(userId);
    const { data: playlistsRaw } = useGetApiUsersIdPlaylists(userId, { PageSize: 20 });
    const { data: followersRaw } = useGetApiUsersIdFollowers(userId, { PageSize: 20 });
    const { data: followingRaw } = useGetApiUsersIdFollowing(userId, { PageSize: 20 });

    const user = userRaw as unknown as UserProfileDto | undefined;

    // ── 2. Мемоізація та безпечний парсинг без any ────────
    const playlists = useMemo(() => {
        const items = (playlistsRaw as Record<string, unknown> | undefined)?.items as UserPlaylistDto[] | undefined;
        return (items ?? []).map(mapPlaylist);
    }, [playlistsRaw]);

    const followers = useMemo(() => {
        const items = (followersRaw as Record<string, unknown> | undefined)?.items as FollowerDto[] | undefined;
        return (items ?? []).map(mapFollower);
    }, [followersRaw]);

    const following = useMemo(() => {
        const items = (followingRaw as Record<string, unknown> | undefined)?.items as FollowedProfileDto[] | undefined;
        return (items ?? []).map(mapFollowing);
    }, [followingRaw]);

    // ── 3. Мутації підписок ───────────────────────────────
    const { mutate: follow } = usePostApiUsersIdFollow();
    const { mutate: unfollow } = useDeleteApiUsersIdFollow();

    const handleFollowToggle = () => {
        if (!user) return;

        const isCurrentlyFollowing = user.isFollowedByCurrentUser ?? false;

        if (isCurrentlyFollowing) {
            unfollow({ id: userId }, { onSuccess: () => refetchUser() });
        } else {
            follow({ id: userId }, { onSuccess: () => refetchUser() });
        }
    };

    // Налаштування точок адаптивності (відповідає col-6 col-md-4 col-lg-2)
    const swiperBreakpoints = {
        320: { slidesPerView: 2, spaceBetween: 12 },
        768: { slidesPerView: 4, spaceBetween: 16 },
        1200: { slidesPerView: 6, spaceBetween: 16 }
    };

    // ── 4. Завантаження та перевірка ──────────────────────
    if (userLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <div className="spinner-border text-light" role="status" />
            </div>
        );
    }

    if (!user) {
        return <div className="text-center text-secondary mt-5">Користувача не знайдено</div>;
    }

    return (
        <div className="user-page">
            <UserPageHeader
                userId={userId}
                name={user.name ?? ''}
                avatarUrl={getImageUrl(user.avatarUrl)}
                playlistsCount={user.publicPlaylistsCount ?? 0}
                followersCount={user.followersCount ?? 0}
                followingCount={user.followingCount ?? 0}
                isOwner={false} // Завжди false для публічної сторінки чужого профілю
                isFollowing={user.isFollowedByCurrentUser ?? false}
                onFollow={handleFollowToggle}
                onShare={() => navigator.clipboard.writeText(window.location.href)}
            />

            {/* ─── Секція відкритих плейлістів ─────────────────── */}
            {playlists.length > 0 && (
                <section className="user-page__section mb-5">
                    <SectionHeader
                        title="Відкриті плейлісти"
                        // Передаємо функції стрілок лише якщо слайдів більше, ніж вміщає екран
                        onPrev={showArrows ? () => swiperInstance?.slidePrev() : undefined}
                        onNext={showArrows ? () => swiperInstance?.slideNext() : undefined}
                    />
                    <div className="section-slider-wrap">
                        <Swiper
                            modules={[Navigation]}
                            onSwiper={(swiper) => {
                                setSwiperInstance(swiper);
                                setShowArrows(!swiper.isLocked);
                            }}
                            onUpdate={(swiper) => {
                                setShowArrows(!swiper.isLocked);
                            }}
                            breakpoints={swiperBreakpoints}
                            className="user-slider"
                        >
                            {playlists.map((pl) => (
                                <SwiperSlide key={pl.id}>
                                    <PlaylistCard playlist={pl} onClick={(id) => router.push(`/playlist/${id}`)} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </section>
            )}

            {/* ─── Підписники ─────────────────────────── */}
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

            {/* ─── Підписки ───────────────────────────── */}
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
        </div>
    );
};