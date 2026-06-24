'use client';

import { type FormEvent, useState } from 'react';
import Link from 'next/link';
import type { SearchArtistDto } from '@repo/api/client.ts';
import { CoverUpload } from '@/shared/ui/CoverUpload';
import { getImageUrl } from '@/shared/lib/getImageUrl';
import { ArtistSearchSelect } from './ArtistSearchSelect';
import { type ClaimFields, useClaimArtistProfile } from '../model/useClaimArtistProfile';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ClaimArtistFlow = () => {
    const { status, error, submit, isSubmitting } = useClaimArtistProfile();
    const [artist, setArtist] = useState<SearchArtistDto | null>(null);
    const [fields, setFields] = useState<ClaimFields>({
        officialEmail: '',
        links: '',
        message: '',
        proof: null,
    });
    const [emailError, setEmailError] = useState<string>();

    if (status === 'submitted') {
        return (
            <div className="client-become-artist__result">
                <div className="client-become-artist__result-icon client-become-artist__result-icon--wait">
                    <i className="bi bi-hourglass-split" />
                </div>
                <h2 className="client-become-artist__result-title">Заявку надіслано</h2>
                <p className="client-become-artist__result-text">
                    Ми перевіримо, що ви — {artist?.name}, і повідомимо про рішення. Це може зайняти
                    деякий час.
                </p>
                <Link href="/home" className="client-become-artist__btn client-become-artist__btn--primary">
                    На головну
                </Link>
            </div>
        );
    }

    if (!artist) {
        return <ArtistSearchSelect onSelect={setArtist} />;
    }

    const update = <K extends keyof ClaimFields>(key: K, value: ClaimFields[K]) =>
        setFields((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const email = fields.officialEmail.trim();
        if (email && !EMAIL_REGEX.test(email)) {
            setEmailError('Некоректний формат пошти');
            return;
        }
        setEmailError(undefined);
        submit(artist.id ?? '', fields);
    };

    return (
        <form className="client-become-artist__form" onSubmit={handleSubmit} noValidate>
            <div className="client-become-artist__selected">
                {artist.avatarUrl ? (
                    <img
                        src={getImageUrl(artist.avatarUrl) ?? undefined}
                        alt={artist.name ?? ''}
                        className="client-become-artist__selected-avatar"
                    />
                ) : (
                    <span className="client-become-artist__selected-avatar client-become-artist__selected-avatar--placeholder">
                        <i className="bi bi-person" />
                    </span>
                )}
                <div className="client-become-artist__selected-info">
                    <span className="client-become-artist__selected-name">{artist.name}</span>
                    <button
                        type="button"
                        className="client-become-artist__selected-change"
                        onClick={() => setArtist(null)}
                        disabled={isSubmitting}
                    >
                        Змінити
                    </button>
                </div>
            </div>

            <div className="client-become-artist__field">
                <label className="client-become-artist__label">Офіційна пошта</label>
                <input
                    type="email"
                    className={`client-become-artist__input${emailError ? ' is-invalid' : ''}`}
                    placeholder="artist@label.com"
                    value={fields.officialEmail}
                    disabled={isSubmitting}
                    onChange={(event) => {
                        update('officialEmail', event.target.value);
                        if (emailError) setEmailError(undefined);
                    }}
                />
                {emailError && <div className="client-become-artist__error">{emailError}</div>}
            </div>

            <div className="client-become-artist__field">
                <label className="client-become-artist__label">Посилання (соцмережі, сайт)</label>
                <input
                    type="text"
                    className="client-become-artist__input"
                    placeholder="https://instagram.com/…"
                    value={fields.links}
                    disabled={isSubmitting}
                    onChange={(event) => update('links', event.target.value)}
                />
            </div>

            <div className="client-become-artist__field">
                <label className="client-become-artist__label">Повідомлення адміну</label>
                <textarea
                    className="client-become-artist__textarea"
                    rows={3}
                    placeholder="Розкажіть, чому це ваш профіль"
                    value={fields.message}
                    disabled={isSubmitting}
                    onChange={(event) => update('message', event.target.value)}
                />
            </div>

            <div className="client-become-artist__field">
                <label className="client-become-artist__label">
                    Документ-підтвердження (необов’язково)
                </label>
                <CoverUpload value={fields.proof} onChange={(file) => update('proof', file)} disabled={isSubmitting} />
            </div>

            {error && <div className="client-become-artist__error mb-2">{error}</div>}

            <button
                type="submit"
                className="client-become-artist__btn client-become-artist__btn--primary w-100"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Надсилання…' : 'Подати заявку'}
            </button>
        </form>
    );
};

export default ClaimArtistFlow;
