'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import type { Swiper as SwiperClass } from 'swiper/types';

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
} from '@repo/api/client.ts';
import { UserPageHeader } from './UserPageHeader';
import { ReportUserModal } from '@/features/complaint/ui/ReportUserModal';
import { UserCard, type UserCardData } from '@/entities/user/ui/UserCard';
import { PlaylistCard, type PlaylistCardData } from '@/entities/playlist/ui/PlaylistCard';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { getImageUrl } from '@/shared/lib/getImageUrl';

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

export const UserProfilePage = ({ userId }: UserProfilePageProps) => {
    const router = useRouter();

    const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(null);
    const [showArrows, setShowArrows] = useState(false);

    const [showReport, setShowReport] = useState(false);
    const [successToast, setSuccessToast] = useState<string | null>(null);

    // ── Запити даних ─────────────────────────────────────
    const { data: userRaw, isLoading: userLoading, refetch: refetchUser } = useGetApiUsersId(userId);
    const { data: playlistsRaw } = useGetApiUsersIdPlaylists(userId, { PageSize: 20 });
    const { data: followersRaw } = useGetApiUsersIdFollowers(userId, { PageSize: 20 });
    const { data: followingRaw } = useGetApiUsersIdFollowing(userId, { PageSize: 20 });

    const user = userRaw as unknown as UserProfileDto | undefined;

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

    // ── Мутації ──────────────────────────────────────────
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

    const handleReportSuccess = () => {
        setSuccessToast("Скарга успішно зареєстрована модераційним вузлом.");
        setTimeout(() => setSuccessToast(null), 4000);
    };

    const swiperBreakpoints = {
        320: { slidesPerView: 2, spaceBetween: 12 },
        768: { slidesPerView: 4, spaceBetween: 16 },
        1200: { slidesPerView: 6, spaceBetween: 16 }
    };

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
                isOwner={false}
                isFollowing={user.isFollowedByCurrentUser ?? false}
                onFollow={handleFollowToggle}
                onReport={() => setShowReport(true)}
            />

            {/* Відкриті плейлісти */}
            {playlists.length > 0 && (
                <section className="user-page__section mb-5">
                    <SectionHeader
                        title="Відкриті плейлісти"
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

            {showReport && (
                <ReportUserModal
                    isOpen={showReport}
                    onClose={() => setShowReport(false)}
                    userId={userId}
                    userName={user.name ?? ''}
                    onSuccess={handleReportSuccess}
                />
            )}

            {successToast && (
                <div className="position-fixed bottom-0 end-0 m-4 p-3 rounded-3 shadow-lg border border-success bg-dark text-success" style={{ zIndex: 1100, fontSize: '13px' }}>
                    <span className="small fw-semibold">✓ {successToast}</span>
                </div>
            )}
        </div>
    );
};