'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
    useGetApiAdminArtistsId,
    useGetApiAdminArtistsIdTeam,
    usePostApiAdminArtistsIdTeam,
    useDeleteApiAdminArtistsIdTeamUserId,
    usePutApiAdminArtistsIdTeamUserId,
    getApiAdminArtistsAutocomplete,
    getApiAdminUsersAutocomplete,
    getGetApiAdminArtistsIdQueryKey,
    getGetApiAdminArtistsIdTeamQueryKey,
    usePutApiAdminArtistsId,
    postApiFilesUpload,
    VerificationStatus,
    ArtistTeamRole,
    type ArtistListItemDto,
    type ArtistDetailsDto,
    type ArtistTeamMemberDto,
    type UpdateArtistCommand,
} from '@repo/api/admin.ts';
import {getImageUrl} from "@/shared/lib/getImageUrl";

// ══════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════
interface Props {
    artist: ArtistListItemDto | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type FormValues = {
    name: string;
    bio: string;
    verificationStatus: VerificationStatus;
};

interface MemberOption {
    userId: string;
    name:   string;
    email:  string;
}

// ══════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════
const ROLE_OPTIONS = Object.values(ArtistTeamRole).filter(r => r !== ArtistTeamRole.Unknown);

// ══════════════════════════════════════════════════════════
// TEAM MEMBER ROW
// ══════════════════════════════════════════════════════════
interface TeamMemberRowProps {
    member: ArtistTeamMemberDto;
    artistId: string;
    onRemove: (userId: string) => void;
    onRoleChange: (userId: string, role: typeof ArtistTeamRole[keyof typeof ArtistTeamRole]) => void;
}

const TeamMemberRow = ({ member, onRemove, onRoleChange }: TeamMemberRowProps) => {

    const avatarSrc = getImageUrl(member.avatarUrl);

    return (
        <div className="d-flex align-items-center gap-3 py-2 border-bottom border-secondary">
            <div
                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                style={{ width: 36, height: 36 }}
            >
                {avatarSrc
                    ? <img src={avatarSrc} alt={member.firstName ?? ''} className="w-100 h-100 object-fit-cover" />
                    : <span className="text-white-50 small">{member.firstName?.charAt(0) ?? '?'}</span>
                }
            </div>

            <div className="flex-grow-1 min-w-0">
                <p className="text-white mb-0 small fw-semibold text-truncate">
                    {member.firstName ?? '—'}
                </p>
                <p className="text-secondary mb-0" style={{ fontSize: 11 }}>
                    {member.email ?? '—'}
                </p>
            </div>

            <select
                className="form-select form-select-sm admin-login__input text-white"
                style={{ width: 110 }}
                value={member.role ?? ArtistTeamRole.Viewer}
                onChange={(e) => onRoleChange(
                    member.userId!,
                    e.target.value as typeof ArtistTeamRole[keyof typeof ArtistTeamRole]
                )}
            >
                {ROLE_OPTIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                ))}
            </select>

            <button
                type="button"
                className="btn btn-sm btn-outline-danger border-0 shadow-none px-2"
                onClick={() => onRemove(member.userId!)}
                title="Remove from team"
            >
                <i className="bi bi-x-lg" />
            </button>
        </div>
    );
};

// ══════════════════════════════════════════════════════════
// ADD MEMBER SEARCH
// ══════════════════════════════════════════════════════════
interface AddMemberSearchProps {
    artistId: string;
    existingUserIds: string[];
    onAdd: (userId: string, role: typeof ArtistTeamRole[keyof typeof ArtistTeamRole]) => void;
}

const AddMemberSearch = ({ existingUserIds, onAdd }: AddMemberSearchProps) => {
    const [term,      setTerm]      = useState('');
    const [options,   setOptions]   = useState<MemberOption[]>([]);
    const [isOpen,    setIsOpen]    = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [role,      setRole]      = useState<typeof ArtistTeamRole[keyof typeof ArtistTeamRole]>(ArtistTeamRole.Editor);
    const [selected,  setSelected]  = useState<MemberOption | null>(null);

    useEffect(() => {
        if (term.trim().length < 3) {
            setOptions([]);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                // Крок 1 — шукаємо артистів по імені
                const artistRes = await getApiAdminArtistsAutocomplete({
                    searchTerm: term,
                    limit: 10,
                });

                console.log('[search] artistRes full:', JSON.stringify(artistRes));

                type RawArtist = {
                    id?: string;
                    name?: string | null;
                    ownerEmail?: string | null;
                };
                const rawArtists = artistRes as { data?: RawArtist[] } | RawArtist[];
                const artists: RawArtist[] = Array.isArray(rawArtists)
                    ? rawArtists
                    : ((rawArtists as { data?: RawArtist[] }).data ?? []);

                // Крок 2 — для кожного артиста знаходимо userId через ownerEmail
                const results = await Promise.all(
                    artists
                        .filter(a => a.ownerEmail)
                        .map(async (a): Promise<MemberOption | null> => {
                            try {
                                const userRes = await getApiAdminUsersAutocomplete({
                                    searchTerm: a.ownerEmail!,
                                    limit: 1,
                                });

                                type RawUser = {
                                    id?: string;
                                    email?: string | null;
                                    firstName?: string | null;
                                };
                                const rawUsers = userRes as RawUser[] | { data?: RawUser[] };
                                const users: RawUser[] = Array.isArray(rawUsers)
                                    ? rawUsers
                                    : (rawUsers.data ?? []);

                                const user = users[0];
                                if (!user?.id) return null;

                                return {
                                    userId: user.id,
                                    name:   a.name       ?? '—',
                                    email:  a.ownerEmail ?? '—',
                                };
                            } catch {
                                return null;
                            }
                        })
                );

                const filtered = results
                    .filter((r): r is MemberOption => r !== null)
                    .filter(r => !existingUserIds.includes(r.userId));

                setOptions(filtered);
                setIsOpen(filtered.length > 0);
            } catch {
                setOptions([]);
                setIsOpen(false);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [term, existingUserIds]);

    const handleSelect = (opt: MemberOption) => {
        setSelected(opt);
        setTerm(opt.name);
        setIsOpen(false);
        setOptions([]);
    };

    const handleAdd = () => {
        if (!selected) return;
        onAdd(selected.userId, role);
        setSelected(null);
        setTerm('');
        setOptions([]);
    };

    return (
        <div className="mt-3">
            <p className="text-secondary small fw-semibold text-uppercase mb-2">
                Add team member
            </p>

            <div className="d-flex gap-2 align-items-start flex-wrap">
                <div className="position-relative flex-grow-1" style={{ minWidth: 200 }}>
                    <input
                        type="text"
                        className="form-control admin-login__input"
                        placeholder="Search by artist name (min 3 chars)..."
                        value={term}
                        onChange={(e) => { setTerm(e.target.value); setSelected(null); }}
                        onFocus={() => options.length > 0 && setIsOpen(true)}
                        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                        autoComplete="off"
                    />

                    {isLoading && (
                        <div className="position-absolute end-0 top-50 translate-middle-y pe-3">
                            <div className="spinner-border spinner-border-sm text-secondary" />
                        </div>
                    )}

                    {isOpen && options.length > 0 && (
                        <ul
                            className="list-unstyled mb-0 position-absolute w-100 rounded border border-secondary shadow"
                            style={{
                                top: '100%',
                                zIndex: 1200,
                                backgroundColor: '#2a2f3d',
                                maxHeight: 180,
                                overflowY: 'auto',
                            }}
                        >
                            {options.map(opt => (
                                <li
                                    key={opt.userId}
                                    className="px-3 py-2 text-white small"
                                    style={{ cursor: 'pointer' }}
                                    onMouseDown={() => handleSelect(opt)}
                                >
                                    <span className="fw-semibold">{opt.name}</span>
                                    {opt.email !== '—' && (
                                        <span className="text-secondary ms-2">{opt.email}</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}

                    {!isLoading && term.trim().length >= 3 && !isOpen && options.length === 0 && !selected && (
                        <div
                            className="position-absolute w-100 rounded border border-secondary px-3 py-2 text-secondary small"
                            style={{ top: '100%', zIndex: 1200, backgroundColor: '#2a2f3d' }}
                        >
                            No artists found
                        </div>
                    )}
                </div>

                <select
                    className="form-select admin-login__input text-white"
                    style={{ width: 120 }}
                    value={role}
                    onChange={(e) => setRole(
                        e.target.value as typeof ArtistTeamRole[keyof typeof ArtistTeamRole]
                    )}
                >
                    {ROLE_OPTIONS.map(r => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>

                <button
                    type="button"
                    className="btn btn-primary px-3"
                    onClick={handleAdd}
                    disabled={!selected || isLoading}
                >
                    Add
                </button>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════
// EDIT ARTIST MODAL
// ══════════════════════════════════════════════════════════
export const EditArtistModal = ({ artist, isOpen, onClose, onSuccess }: Props) => {
    const {
        register, handleSubmit, setError, reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>();

    const artistId = artist?.id ?? '';

    // ─── Запити ───────────────────────────────────────────
    const { data: detailsRaw, isLoading } = useGetApiAdminArtistsId(artistId, {
        query: {
            queryKey: getGetApiAdminArtistsIdQueryKey(artistId),
            enabled:  isOpen && !!artistId,
        },
    });

    const { data: teamRaw, refetch: refetchTeam } = useGetApiAdminArtistsIdTeam(artistId, {
        query: {
            queryKey: getGetApiAdminArtistsIdTeamQueryKey(artistId),
            enabled:  isOpen && !!artistId,
        },
    });

    const [avatarFileId, setAvatarFileId] = useState<string | null>(null);
    const [previewUrl,   setPreviewUrl]   = useState<string | null>(null);
    const [isUploading,  setIsUploading]  = useState(false);
    const [uploadError,  setUploadError]  = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        setUploadError(null);
        try {
            const res = await postApiFilesUpload({ file });
            const data = res as { fileId?: string; url?: string };
            if (!data.fileId) throw new Error('No fileId in response');
            setAvatarFileId(data.fileId);
            setPreviewUrl(data.url ?? null);
        } catch {
            setUploadError('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const { mutateAsync: updateArtist,  isPending } = usePutApiAdminArtistsId();
    const { mutateAsync: addMember }                = usePostApiAdminArtistsIdTeam();
    const { mutateAsync: removeMember }             = useDeleteApiAdminArtistsIdTeamUserId();
    const { mutateAsync: updateMemberRole }         = usePutApiAdminArtistsIdTeamUserId();

    // ─── Типізовані дані ──────────────────────────────────
    const details: ArtistDetailsDto | undefined =
        (detailsRaw as { data?: ArtistDetailsDto } | undefined)?.data
        ?? detailsRaw as ArtistDetailsDto | undefined;

    const team: ArtistTeamMemberDto[] = (() => {
        type RawTeam = { data?: ArtistTeamMemberDto[] } | ArtistTeamMemberDto[] | undefined;
        const raw = teamRaw as RawTeam;
        if (Array.isArray(raw)) return raw;
        return (raw as { data?: ArtistTeamMemberDto[] })?.data ?? [];
    })();

    const existingUserIds = team.map(m => m.userId ?? '').filter(Boolean);

    // ─── Pre-fill форми ───────────────────────────────────
    useEffect(() => {
        if (!details) return;
        reset({
            name:               details.name               ?? '',
            bio:                details.bio                ?? '',
            verificationStatus: details.verificationStatus ?? VerificationStatus.Pending,
        });
    }, [details, reset]);

    // ─── Submit ───────────────────────────────────────────
    const onSubmit = async (values: FormValues) => {
        if (!artistId) return;

        const body: UpdateArtistCommand = {
            name:               values.name,
            bio:                values.bio || '',
            verificationStatus: values.verificationStatus,
            avatarFileId:       avatarFileId ?? null,
            bannerFileId:       null,
            ownerUserId:        details?.owner?.userId ?? null,
        };

        try {
            await updateArtist({ id: artistId, data: body });
            onSuccess();
            onClose();
        } catch (error: unknown) {
            const err = error as {
                response?: { status?: number; data?: { errors?: Record<string, string[]> } };
            };
            const status       = err.response?.status;
            const serverErrors = err.response?.data?.errors;

            if (status === 400 && serverErrors) {
                Object.keys(serverErrors).forEach((field) => {
                    const key = (field.charAt(0).toLowerCase() + field.slice(1)) as keyof FormValues;
                    setError(key, { type: 'server', message: serverErrors[field]?.[0] });
                });
            } else {
                setError('root', { message: `Error ${status}: Failed to update artist.` });
            }
        }
    };

    // ─── Team handlers ────────────────────────────────────
    const handleAddMember = async (
        userId: string,
        role: typeof ArtistTeamRole[keyof typeof ArtistTeamRole]
    ) => {
        await addMember({ id: artistId, data: { artistId, userId, role } });
        refetchTeam();
    };

    const handleRemoveMember = async (userId: string) => {
        await removeMember({ id: artistId, userId });
        refetchTeam();
    };

    const handleRoleChange = async (
        userId: string,
        newRole: typeof ArtistTeamRole[keyof typeof ArtistTeamRole]
    ) => {
        await updateMemberRole({ id: artistId, userId, data: { artistId, userId, newRole } });
        refetchTeam();
    };

    if (!isOpen || !artist) return null;

    // Путь к аватару
    const avatarSrc = getImageUrl(artist.avatarUrl);

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">

                    {/* Header */}
                    <div className="modal-header border-secondary p-4">
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                                style={{ width: 45, height: 45 }}
                            >
                                {avatarSrc
                                    ? <img src={avatarSrc} alt="avatar" className="w-100 h-100 object-fit-cover" />
                                    : <span className="fw-bold">{artist.name?.charAt(0)?.toUpperCase()}</span>
                                }
                            </div>
                            <div>
                                <h5 className="modal-title fw-bold mb-0 text-cyan">Edit Artist</h5>
                                <small className="text-secondary">ID: {artist.id}</small>
                            </div>
                        </div>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} />
                    </div>

                    {isLoading ? (
                        <div className="modal-body p-5 text-center">
                            <div className="spinner-border text-info" />
                            <p className="text-secondary mt-3">Fetching artist details...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="modal-body p-4" style={{ overflowY: 'auto', maxHeight: '70vh' }}>

                                {errors.root && (
                                    <div className="alert alert-danger py-2 mb-3">{errors.root.message}</div>
                                )}

                                {/* Name */}
                                <div className="mb-4">
                                    <label className="form-label admin-text small fw-bold">ARTIST NAME *</label>
                                    <input
                                        type="text"
                                        className={`form-control admin-login__input${errors.name ? ' is-invalid' : ''}`}
                                        {...register('name', { required: 'Name is required' })}
                                    />
                                    {errors.name && (
                                        <div className="invalid-feedback">{errors.name.message}</div>
                                    )}
                                </div>

                                {/* Status */}
                                <div className="mb-4">
                                    <label className="form-label admin-text small fw-bold">STATUS</label>
                                    <select
                                        className="form-select admin-login__input text-white"
                                        {...register('verificationStatus')}
                                    >
                                        {Object.values(VerificationStatus).map(v => (
                                            <option key={v} value={v}>{v}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Bio */}
                                <div className="mb-4">
                                    <label className="form-label admin-text small fw-bold">BIOGRAPHY</label>
                                    <textarea
                                        className="form-control admin-login__input h-auto py-3"
                                        rows={4}
                                        {...register('bio')}
                                    />
                                </div>

                                {/* Avatar */}
                                <div className="mb-4">
                                    <label className="form-label admin-text small fw-bold">AVATAR IMAGE</label>
                                    <div
                                        className={`upload-input ${avatarFileId ? 'border-success' : ''}`}
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{ cursor: 'pointer', minHeight: '38px' }}
                                    >
                                        {previewUrl
                                            ? <img src={previewUrl} alt="avatar preview" className="img-fluid rounded" style={{ maxHeight: '80px' }} />
                                            : <p className="mb-0 small mt-1 text-center text-secondary">Click to replace (leave empty to keep current)</p>
                                        }
                                    </div>
                                    <input ref={fileInputRef} type="file" accept="image/*" className="d-none" onChange={handleFileChange} />
                                    {isUploading && <p className="text-info small mt-1">Uploading...</p>}
                                    {uploadError && <p className="text-danger small mt-1">{uploadError}</p>}
                                    {avatarFileId && !uploadError && <p className="text-success small mt-1">New avatar uploaded</p>}
                                </div>

                                {/* ─── Team ─────────────────────────────── */}
                                <div className="border-top border-secondary pt-4">
                                    <p className="fw-semibold text-white mb-3">
                                        Team Members
                                        {team.length > 0 && (
                                            <span className="badge bg-secondary ms-2">{team.length}</span>
                                        )}
                                    </p>

                                    {team.length === 0 ? (
                                        <p className="text-secondary small mb-0">No team members yet.</p>
                                    ) : (
                                        <div className="mb-2">
                                            {team.map((member) => (
                                                <TeamMemberRow
                                                    key={member.userId}
                                                    member={member}
                                                    artistId={artistId}
                                                    onRemove={handleRemoveMember}
                                                    onRoleChange={handleRoleChange}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    <AddMemberSearch
                                        artistId={artistId}
                                        existingUserIds={existingUserIds}
                                        onAdd={handleAddMember}
                                    />
                                </div>

                            </div>

                            <div className="modal-footer border-0 p-4">
                                <button
                                    type="button"
                                    className="btn btn-admin-dark px-4"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary px-5 fw-bold"
                                    disabled={isPending || isSubmitting || isUploading}
                                >
                                    {isPending ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};