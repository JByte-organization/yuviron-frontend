'use client';

import React, { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    AppPermission,
    usePostApiStudioArtistProfileArtistIdVerify,
    usePostApiStudioArtistProfileArtistIdSocialLinks,
    useDeleteApiStudioArtistProfileArtistIdSocialLinksType,
    type SocialLinkType,
    type StudioSocialLinkDto,
} from '@repo/api/artist.ts';
import { usePostApiFilesUpload } from '@repo/api/client.ts';

const extractFileId = (res: unknown): string | null => {
    const r = res as { fileId?: string; data?: { fileId?: string } } | null;
    return r?.data?.fileId ?? r?.fileId ?? null;
};

// ══════════════════════════════════════════════════════════
// СОЦМЕРЕЖІ
// ══════════════════════════════════════════════════════════

// value — це значення enum SocialLinkType з бекенду (PascalCase). Бек прийма
// тільки ці типи; нижній регістр валиться 500-кою на рівні БД-enum.
const LINK_TYPES: { value: SocialLinkType; label: string; icon: string }[] = [
    { value: 'Instagram', label: 'Instagram',   icon: 'bi-instagram' },
    { value: 'YouTube',   label: 'YouTube',     icon: 'bi-youtube' },
    { value: 'TikTok',    label: 'TikTok',      icon: 'bi-tiktok' },
    { value: 'Facebook',  label: 'Facebook',    icon: 'bi-facebook' },
    { value: 'Twitter',   label: 'X (Twitter)', icon: 'bi-twitter-x' },
    { value: 'Spotify',   label: 'Spotify',     icon: 'bi-spotify' },
    { value: 'Website',   label: 'Сайт',        icon: 'bi-globe' },
];

interface LinkRow {
    type: SocialLinkType;
    url: string;
}

interface SocialLinksProps {
    artistId: string;
    /** Поточні лінки з профілю (StudioArtistProfileDto.socialLinks). */
    initialLinks: StudioSocialLinkDto[] | null | undefined;
}

export const ArtistSocialLinksBlock = ({ artistId, initialLinks }: SocialLinksProps) => {
    const queryClient = useQueryClient();
    const [rows, setRows] = useState<LinkRow[]>([]);
    const [dirty, setDirty] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Префіл з профілю — лише доки користувач не почав редагувати.
    // Синхронізація стану під час рендера (you-might-not-need-an-effect).
    const [syncedLinks, setSyncedLinks] = useState<typeof initialLinks>(undefined);
    if (!dirty && initialLinks !== syncedLinks) {
        setSyncedLinks(initialLinks);
        setRows((initialLinks ?? []).map(l => ({ type: l.type ?? 'Website', url: l.url ?? '' })));
    }

    const { mutateAsync: addLink, isPending: isAdding } =
        usePostApiStudioArtistProfileArtistIdSocialLinks();
    const { mutateAsync: removeLink, isPending: isRemoving } =
        useDeleteApiStudioArtistProfileArtistIdSocialLinksType();
    const isPending = isAdding || isRemoving;

    const update = (index: number, patch: Partial<LinkRow>) => {
        setDirty(true);
        setSaved(false);
        setRows(prev => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
    };

    const addRow = () => {
        setDirty(true);
        setSaved(false);
        setRows(prev => [...prev, { type: 'Instagram', url: '' }]);
    };

    const removeRow = (index: number) => {
        setDirty(true);
        setSaved(false);
        setRows(prev => prev.filter((_, i) => i !== index));
    };

    const allValid = rows.every(r => /^https?:\/\/\S+/.test(r.url.trim()));

    const submit = async () => {
        setError(null);
        try {
            // Новий контракт: одна площадка = окремий ресурс. DELETE по типах, які
            // прибрали, і POST (upsert) по поточних — замість старого bulk-PUT.
            const currentTypes = new Set(rows.map(r => r.type));
            const removed = (initialLinks ?? [])
                .map(l => l.type)
                .filter((t): t is SocialLinkType => !!t && !currentTypes.has(t));

            for (const type of removed) {
                await removeLink({ artistId, type });
            }
            for (const row of rows) {
                await addLink({ artistId, data: { type: row.type, url: row.url.trim() } });
            }

            setDirty(false);
            setSaved(true);
            await queryClient.invalidateQueries({ queryKey: ['/api/studio-artist/profile'] });
        } catch {
            setError('Не вдалося зберегти посилання.');
        }
    };

    return (
        <div className="artist-settings-page__section mt-5">
            <label className="artist-settings-page__field-label">Соцмережі</label>

            {rows.length === 0 && (
                <p className="text-secondary" style={{ fontSize: 14 }}>
                    Додайте посилання — вони зʼявляться на публічній сторінці артиста.
                </p>
            )}

            <div className="d-flex flex-column gap-2">
                {rows.map((row, i) => (
                    // На xs стек: селект площадки на всю ширину, нижче — url + кошик
                    // в один ряд. З sm — усе в рядок. Без фіксованих ширин, що ламали
                    // вёрстку на телефоні (input стискався / виходив за екран).
                    <div key={i} className="d-flex flex-column flex-sm-row gap-2 align-items-stretch align-items-sm-center">
                        <select
                            className="client-modal__input flex-sm-shrink-0"
                            style={{ minWidth: 150 }}
                            value={row.type}
                            onChange={e => update(i, { type: e.target.value as SocialLinkType })}
                        >
                            {LINK_TYPES.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                        <div className="d-flex gap-2 align-items-center flex-grow-1">
                            <input
                                type="url"
                                className={`client-modal__input flex-grow-1${row.url && !/^https?:\/\/\S+/.test(row.url.trim()) ? ' client-modal__input--error' : ''}`}
                                placeholder="https://…"
                                value={row.url}
                                onChange={e => update(i, { url: e.target.value })}
                            />
                            <button
                                type="button"
                                className="artist-tracks-page__row-btn artist-tracks-page__row-btn--danger flex-shrink-0"
                                title="Прибрати"
                                onClick={() => removeRow(i)}
                            >
                                <i className="bi bi-trash" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="d-flex align-items-center gap-3 mt-3 flex-wrap">
                <button
                    type="button"
                    className="client-modal__btn client-modal__btn--ghost"
                    onClick={addRow}
                >
                    <i className="bi bi-plus-lg me-1" />
                    Додати посилання
                </button>
                <button
                    type="button"
                    className="client-modal__btn client-modal__btn--primary"
                    disabled={!dirty || !allValid || isPending}
                    onClick={submit}
                >
                    {isPending ? 'Зберігаємо…' : 'Зберегти посилання'}
                </button>
                {error && <span className="client-modal__field-error">{error}</span>}
                {saved && (
                    <span className="artist-settings-page__saved">
                        <i className="bi bi-check-circle me-2" />
                        Збережено!
                    </span>
                )}
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════
// ВЕРИФІКАЦІЯ
// ══════════════════════════════════════════════════════════

interface VerificationProps {
    artistId: string;
    /** StudioArtistProfileDto.verificationStatus: None | Pending | Verified | Rejected */
    status: string | null | undefined;
}

export const ArtistVerificationBlock = ({ artistId, status }: VerificationProps) => {
    const queryClient = useQueryClient();
    const [officialEmail, setOfficialEmail] = useState('');
    const [links, setLinks] = useState('');
    const [message, setMessage] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const proofRef = useRef<HTMLInputElement>(null);

    const { mutateAsync: uploadFile } = usePostApiFilesUpload();
    const { mutateAsync: requestVerification, isPending } = usePostApiStudioArtistProfileArtistIdVerify();

    const emailValid = /\S+@\S+\.\S+/.test(officialEmail.trim());

    const submit = async () => {
        setError(null);
        try {
            const proofFileId = proofFile
                ? extractFileId(await uploadFile({ data: { file: proofFile } }))
                : null;
            await requestVerification({
                artistId,
                data: {
                    artistId,
                    officialEmail: officialEmail.trim(),
                    links: links.trim() || null,
                    message: message.trim() || null,
                    proofFileId,
                    requiredPermission: AppPermission.StudioArtistManage,
                },
            });
            setSubmitted(true);
            await queryClient.invalidateQueries({ queryKey: ['/api/studio-artist/profile'] });
        } catch {
            setError('Не вдалося надіслати заявку. Спробуйте ще раз.');
        }
    };

    // Verified / Pending / щойно надіслано — лише статусний блок без форми.
    if (status === 'Verified') {
        return (
            <div className="artist-settings-page__section mt-5">
                <label className="artist-settings-page__field-label">Верифікація</label>
                <p style={{ color: '#00A6FF', fontWeight: 600 }}>
                    <i className="bi bi-patch-check-fill me-2" />
                    Профіль верифіковано
                </p>
            </div>
        );
    }

    if (status === 'Pending' || submitted) {
        return (
            <div className="artist-settings-page__section mt-5">
                <label className="artist-settings-page__field-label">Верифікація</label>
                <p style={{ color: '#FFB347', fontWeight: 600 }}>
                    <i className="bi bi-hourglass-split me-2" />
                    Заявку на верифікацію подано — очікуйте на рішення модерації.
                </p>
            </div>
        );
    }

    return (
        <div className="artist-settings-page__section mt-5">
            <label className="artist-settings-page__field-label">Верифікація</label>
            {status === 'Rejected' && (
                <p style={{ color: '#FF6B6B', fontSize: 14 }}>
                    <i className="bi bi-x-circle me-2" />
                    Попередню заявку відхилено. Ви можете подати нову з додатковими доказами.
                </p>
            )}
            <p className="text-secondary" style={{ fontSize: 14 }}>
                Верифікований бейдж підтверджує, що профілем керує сам артист або його команда.
            </p>

            <div className="row g-3">
                <div className="col-12 col-md-6">
                    <label className="artist-settings-page__field-label">Офіційний email *</label>
                    <input
                        type="email"
                        className="client-modal__input"
                        placeholder="management@artist.com"
                        value={officialEmail}
                        onChange={e => setOfficialEmail(e.target.value)}
                    />
                </div>
                <div className="col-12 col-md-6">
                    <label className="artist-settings-page__field-label">Посилання (соцмережі, стрімінги)</label>
                    <input
                        type="text"
                        className="client-modal__input"
                        placeholder="https://instagram.com/…, https://open.spotify.com/…"
                        value={links}
                        onChange={e => setLinks(e.target.value)}
                    />
                </div>
                <div className="col-12">
                    <label className="artist-settings-page__field-label">Повідомлення модерації</label>
                    <textarea
                        className="client-modal__input"
                        rows={3}
                        style={{ resize: 'vertical' }}
                        placeholder="Розкажіть, чому саме ви керуєте цим профілем…"
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                    />
                </div>
                <div className="col-12 d-flex align-items-center gap-3 flex-wrap">
                    <button
                        type="button"
                        className="client-modal__btn client-modal__btn--ghost"
                        onClick={() => proofRef.current?.click()}
                    >
                        <i className="bi bi-paperclip me-1" />
                        {proofFile ? proofFile.name : 'Додати документ-доказ'}
                    </button>
                    <input
                        ref={proofRef}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                        className="d-none"
                        onChange={e => setProofFile(e.target.files?.[0] ?? null)}
                    />
                    <button
                        type="button"
                        className="client-modal__btn client-modal__btn--primary"
                        disabled={!emailValid || isPending}
                        onClick={submit}
                    >
                        {isPending ? 'Надсилаємо…' : 'Подати заявку'}
                    </button>
                    {error && <span className="client-modal__field-error">{error}</span>}
                </div>
            </div>
        </div>
    );
};
