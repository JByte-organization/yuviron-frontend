'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
    AppPermission,
    ArtistTeamRole,
    getGetApiStudioArtistTeamArtistIdQueryKey,
    useDeleteApiStudioArtistTeamArtistIdTargetUserId,
    useGetApiStudioArtistTeamArtistId,
    usePostApiStudioArtistTeamArtistIdInvite,
    usePutApiStudioArtistTeamArtistIdTargetUserIdRole,
    type TeamMemberDto,
} from '@repo/api/artist.ts';
import { useCurrentArtistId } from '@/entities/artist/model/currentArtist';
import { ChartError, ChartSkeleton } from '@/entities/artist/ui/AnalyticsChartParts';
import { getImageUrl } from '@/shared/lib/getImageUrl';

const unwrapList = <T,>(raw: unknown): T[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as T[];
    const obj = raw as { data?: T[] };
    return Array.isArray(obj.data) ? obj.data : [];
};

/** Ролі, які можна призначити (Owner лише один — створювач профілю). */
const ASSIGNABLE_ROLES: { value: ArtistTeamRole; label: string }[] = [
    { value: ArtistTeamRole.Manager, label: 'Менеджер' },
    { value: ArtistTeamRole.Editor,  label: 'Редактор' },
    { value: ArtistTeamRole.Viewer,  label: 'Глядач' },
];

const ROLE_LABELS: Record<string, string> = {
    Owner:   'Власник',
    Manager: 'Менеджер',
    Editor:  'Редактор',
    Viewer:  'Глядач',
    Unknown: '—',
};

export const ArtistTeamPage = () => {
    const artistId = useCurrentArtistId();
    const queryClient = useQueryClient();

    const teamQuery = useGetApiStudioArtistTeamArtistId(artistId ?? '', {
        query: {
            enabled: !!artistId,
            queryKey: getGetApiStudioArtistTeamArtistIdQueryKey(artistId ?? ''),
        },
    });
    const members = unwrapList<TeamMemberDto>(teamQuery.data);

    const refetchTeam = () =>
        queryClient.invalidateQueries({ queryKey: ['/api/studio-artist/team'] });

    // ─── Інвайт ─────────────────────────────────────────
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<ArtistTeamRole>(ArtistTeamRole.Viewer);
    const [inviteError, setInviteError] = useState<string | null>(null);
    const [inviteOk, setInviteOk] = useState(false);
    const { mutateAsync: inviteMember, isPending: isInviting } = usePostApiStudioArtistTeamArtistIdInvite();

    const emailValid = /\S+@\S+\.\S+/.test(inviteEmail.trim());

    const submitInvite = async () => {
        if (!artistId || !emailValid) return;
        setInviteError(null);
        setInviteOk(false);
        try {
            await inviteMember({
                artistId,
                data: {
                    artistId,
                    userEmail: inviteEmail.trim(),
                    role: inviteRole,
                    requiredPermission: AppPermission.StudioArtistManage,
                },
            });
            setInviteEmail('');
            setInviteOk(true);
            await refetchTeam();
        } catch (e) {
            const status = (e as { response?: { status?: number } })?.response?.status;
            setInviteError(
                status === 404
                    ? 'Користувача з такою поштою не знайдено.'
                    : 'Не вдалося надіслати запрошення. Спробуйте ще раз.',
            );
        }
    };

    // ─── Зміна ролі / видалення ─────────────────────────
    const { mutateAsync: changeRole } = usePutApiStudioArtistTeamArtistIdTargetUserIdRole();
    const { mutateAsync: removeMember } = useDeleteApiStudioArtistTeamArtistIdTargetUserId();
    const [rowError, setRowError] = useState<string | null>(null);
    const [removing, setRemoving] = useState<TeamMemberDto | null>(null);

    const handleRoleChange = async (member: TeamMemberDto, newRole: ArtistTeamRole) => {
        if (!artistId || !member.userId) return;
        setRowError(null);
        try {
            await changeRole({
                artistId,
                targetUserId: member.userId,
                data: {
                    artistId,
                    targetUserId: member.userId,
                    newRole,
                    requiredPermission: AppPermission.StudioArtistManage,
                },
            });
            await refetchTeam();
        } catch {
            setRowError('Не вдалося змінити роль.');
        }
    };

    const handleRemove = async () => {
        if (!artistId || !removing?.userId) return;
        setRowError(null);
        try {
            await removeMember({ artistId, targetUserId: removing.userId });
            setRemoving(null);
            await refetchTeam();
        } catch {
            setRemoving(null);
            setRowError('Не вдалося видалити учасника.');
        }
    };

    return (
        <div className="artist-analytics-page">

            {/* ─── Заголовок ────────────────────────── */}
            <div className="artist-analytics-page__header">
                <h1 className="artist-analytics-page__title">Команда</h1>
            </div>

            {/* ─── Інвайт ────────────────────────────── */}
            <div className="artist-analytics-page__chart-block mb-5">
                <h2 className="artist-analytics-page__chart-title">Запросити учасника</h2>
                <div className="row g-3 mt-1 align-items-end">
                    <div className="col-12 col-md-5">
                        <label className="artist-settings-page__field-label">Email користувача</label>
                        <input
                            type="email"
                            className="client-modal__input"
                            placeholder="user@example.com"
                            value={inviteEmail}
                            onChange={e => { setInviteEmail(e.target.value); setInviteOk(false); }}
                        />
                    </div>
                    <div className="col-12 col-md-4">
                        <label className="artist-settings-page__field-label">Роль</label>
                        <select
                            className="client-modal__input"
                            value={inviteRole}
                            onChange={e => setInviteRole(e.target.value as ArtistTeamRole)}
                        >
                            {ASSIGNABLE_ROLES.map(role => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-12 col-md-3">
                        <button
                            className="client-modal__btn client-modal__btn--primary w-100"
                            disabled={!emailValid || isInviting}
                            onClick={submitInvite}
                        >
                            {isInviting ? 'Надсилаємо…' : 'Запросити'}
                        </button>
                    </div>
                </div>
                {inviteError && <div className="client-modal__field-error mt-2">{inviteError}</div>}
                {inviteOk && (
                    <div className="mt-2" style={{ color: '#2ECC71', fontSize: 13 }}>
                        Запрошення надіслано — користувач отримає лист із посиланням.
                    </div>
                )}
            </div>

            {/* ─── Список учасників ──────────────────── */}
            <div className="artist-analytics-page__chart-block">
                <h2 className="artist-analytics-page__chart-title">Учасники</h2>
                {rowError && <div className="client-modal__field-error mt-2">{rowError}</div>}
                {teamQuery.isLoading ? (
                    <ChartSkeleton height={160} />
                ) : teamQuery.isError ? (
                    <ChartError error={teamQuery.error} />
                ) : members.length === 0 ? (
                    <div className="text-secondary py-4 text-center">
                        Поки що ви працюєте соло. Запросіть менеджера або редактора!
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-2 mt-3">
                        {members.map(member => {
                            const isOwner = member.role === ArtistTeamRole.Owner;
                            const avatar = getImageUrl(member.avatarUrl);
                            return (
                                <div key={member.userId} className="artist-analytics-page__top-track">
                                    {avatar ? (
                                        <Image
                                            src={avatar}
                                            alt={member.firstName ?? member.email ?? ''}
                                            width={40}
                                            height={40}
                                            style={{ borderRadius: '50%', objectFit: 'cover' }}
                                            unoptimized
                                        />
                                    ) : (
                                        <span
                                            className="d-inline-flex align-items-center justify-content-center"
                                            style={{
                                                width: 40, height: 40, borderRadius: '50%',
                                                background: 'var(--client-hover)', fontSize: 18,
                                            }}
                                        >
                                            <i className="bi bi-person" />
                                        </span>
                                    )}
                                    <span className="artist-analytics-page__top-track-title">
                                        {member.firstName || member.email || '—'}
                                        {member.firstName && member.email && (
                                            <span className="text-secondary ms-2" style={{ fontSize: 13 }}>
                                                {member.email}
                                            </span>
                                        )}
                                    </span>

                                    {isOwner ? (
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#FFB347' }}>
                                            <i className="bi bi-star-fill me-1" />
                                            {ROLE_LABELS.Owner}
                                        </span>
                                    ) : (
                                        <select
                                            className="client-modal__input"
                                            style={{ width: 'auto', minWidth: 140 }}
                                            value={member.role ?? ArtistTeamRole.Viewer}
                                            onChange={e => handleRoleChange(member, e.target.value as ArtistTeamRole)}
                                        >
                                            {ASSIGNABLE_ROLES.map(role => (
                                                <option key={role.value} value={role.value}>{role.label}</option>
                                            ))}
                                        </select>
                                    )}

                                    <span className="artist-analytics-page__top-track-plays ms-auto">
                                        {member.addedAt ? format(parseISO(member.addedAt), 'dd.MM.yyyy') : ''}
                                    </span>

                                    {!isOwner && (
                                        <button
                                            className="artist-tracks-page__row-btn artist-tracks-page__row-btn--danger"
                                            title="Видалити з команди"
                                            onClick={() => setRemoving(member)}
                                        >
                                            <i className="bi bi-trash" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ─── Підтвердження видалення ───────────── */}
            {removing && (
                <div className="client-modal-backdrop" onClick={() => setRemoving(null)}>
                    <div className="client-modal modal-dialog-sm" onClick={e => e.stopPropagation()}>
                        <div className="client-modal__header">
                            <h2 className="client-modal__title">Видалити учасника?</h2>
                            <button className="client-modal__close" onClick={() => setRemoving(null)}>
                                <i className="bi bi-x-lg" />
                            </button>
                        </div>
                        <div className="client-modal__body">
                            <p>
                                {removing.firstName || removing.email} втратить доступ до кабінету артиста.
                            </p>
                            <div className="d-flex gap-2 justify-content-end">
                                <button className="client-modal__btn client-modal__btn--ghost" onClick={() => setRemoving(null)}>
                                    Скасувати
                                </button>
                                <button className="client-modal__btn client-modal__btn--primary" onClick={handleRemove}>
                                    Видалити
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
