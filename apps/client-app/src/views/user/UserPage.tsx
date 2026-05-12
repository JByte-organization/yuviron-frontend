'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { UserPageHeader } from './ui/UserPageHeader';
import { UserCard, type UserCardData } from '@/entities/user/ui/UserCard';
import { PlaylistCard, type PlaylistCardData } from '@/entities/playlist/ui/PlaylistCard';
import { ShowAllButton } from '@/shared/ui/ShowAllButton';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { EditProfileModal } from '@/features/user/ui/EditProfileModal';

interface UserPageProps {
    userId: string;
}

// ─── Mock ──────────────────────────────────────────────────
// TODO: замінити на useGetApiUsersId(userId)
const MOCK_USER = {
    id:             'user-1',
    name:           'Mariasshev',
    avatarUrl:      null,
    playlistsCount: 11,
    followersCount: 3,
    followingCount: 4,
};

const CURRENT_USER_ID = 'user-1'; // TODO: з useGetApiCurrentUser()

const MOCK_PLAYLISTS: PlaylistCardData[] = [
    { id: 'p1', name: 'Not Today',             authorName: 'Mariasshev', tracksCount: 12, coverUrl: null },
    { id: 'p2', name: 'Blood Sweat & Tears',   authorName: 'Mariasshev', tracksCount: 8,  coverUrl: null },
    { id: 'p3', name: 'plan b',                authorName: 'Mariasshev', tracksCount: 15, coverUrl: null },
    { id: 'p4', name: 'sea viiiibe',           authorName: 'Mariasshev', tracksCount: 20, coverUrl: null },
    { id: 'p5', name: "'25 🔥",                authorName: 'Mariasshev', tracksCount: 30, coverUrl: null },
    { id: 'p6', name: 'Музика в машині',       authorName: 'Mariasshev', tracksCount: 18, coverUrl: null },
    { id: 'p7', name: '20xx',                  authorName: 'Mariasshev', tracksCount: 10, coverUrl: null },
];

const MOCK_FOLLOWERS: UserCardData[] = [
    { id: 'u1', name: 'Oleksandr', avatarUrl: null, isArtist: false },
    { id: 'u2', name: 'Daryna',    avatarUrl: null, isArtist: false },
    { id: 'u3', name: 'BLACKPINK', avatarUrl: null, isArtist: true, artistId: 'bp' },
];

const MOCK_FOLLOWING: UserCardData[] = [
    { id: 'u4', name: 'Katia',     avatarUrl: null, isArtist: false },
    { id: 'u5', name: 'LISA',      avatarUrl: null, isArtist: true, artistId: 'lisa' },
    { id: 'u6', name: 'Ivan',      avatarUrl: null, isArtist: false },
    { id: 'u7', name: 'Lady Gaga', avatarUrl: null, isArtist: true, artistId: 'gaga' },
];

/**
 * Сторінка: Профіль користувача /users/[id]
 *
 * Підключення даних:
 * 1. const { data: user }      = useGetApiUsersId(userId);
 * 2. const { data: playlists } = useGetApiUsersIdPlaylists(userId);
 * 3. const { data: followers } = useGetApiUsersIdFollowers(userId);
 * 4. const { data: following } = useGetApiUsersIdFollowing(userId);
 * 5. const { data: me }        = useGetApiCurrentUser();
 * 6. isOwner = me?.id === userId
 */
export const UserPage = ({ userId }: UserPageProps) => {
    const user      = MOCK_USER;
    const playlists = MOCK_PLAYLISTS;
    const followers = MOCK_FOLLOWERS;
    const following = MOCK_FOLLOWING;
    const isOwner   = userId === CURRENT_USER_ID;

    const [showEditProfile, setShowEditProfile] = useState(false);

    const playlistsSliderRef = useRef<HTMLDivElement>(null);

    const scrollPlaylists = (dir: 'prev' | 'next') => {
        if (!playlistsSliderRef.current) return;
        const amount = playlistsSliderRef.current.offsetWidth * 0.8;
        playlistsSliderRef.current.scrollBy({
            left: dir === 'next' ? amount : -amount,
            behavior: 'smooth',
        });
    };

    return (
        <div className="user-page">

            {/* ─── Хедер ─────────────────────────────── */}
            <UserPageHeader
                userId={user.id}
                name={user.name}
                avatarUrl={user.avatarUrl}
                playlistsCount={user.playlistsCount}
                followersCount={user.followersCount}
                followingCount={user.followingCount}
                isOwner={isOwner}
                onEdit={() => setShowEditProfile(true)}
                onShare={() => console.log('share')}
                onFollow={() => console.log('follow')} // TODO: хук
            />

            {/* ─── Відкриті плейлісти ─────────────────── */}
            <section className="user-page__section mb-5">
                <SectionHeader
                    title="Відкриті плейлісти"
                    onPrev={() => scrollPlaylists('prev')}
                    onNext={() => scrollPlaylists('next')}
                />

                <div className="section-slider-wrap">
                    <div
                        ref={playlistsSliderRef}
                        className="row g-3 flex-nowrap overflow-x-auto user-slider"
                    >
                        {playlists.map((pl) => (
                            <div key={pl.id} className="col-6 col-md-4 col-lg-2">
                                <PlaylistCard playlist={pl} />
                            </div>
                        ))}
                        <div className="col-auto" style={{ minWidth: 80 }} />
                    </div>
                    <div className="section-slider-wrap__show-all">
                        <ShowAllButton href={`/users/${userId}/playlists`} />
                    </div>
                </div>
            </section>

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

            {/* ─── Модалка редагування профілю ────────── */}
            <EditProfileModal
                isOpen={showEditProfile}
                onClose={() => setShowEditProfile(false)}
                onSuccess={() => setShowEditProfile(false)}
                user={{ name: user.name, avatarUrl: user.avatarUrl }}
            />
        </div>

    );
};