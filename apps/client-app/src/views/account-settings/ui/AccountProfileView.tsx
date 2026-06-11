'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    useGetApiAuthMe,
    usePutApiMeAccountProfile,
    usePutApiMeAccountDetails,
    usePutApiMeAccountMarketing,
    getGetApiAuthMeQueryKey,
    type CurrentUserDto,
    type Gender
} from '@repo/api/client';

// 🌍 Список популярних країн з ISO Alpha-2 кодами (можна розширити або винести в shared/lib)
const COUNTRY_LIST = [
    { code: 'UA', name: 'Ukraine' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'PL', name: 'Poland' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'CA', name: 'Canada' }
];

export const AccountProfileView = () => {
    const queryClient = useQueryClient();

    const { data: meRaw, isLoading } = useGetApiAuthMe();
    const me = (meRaw as CurrentUserDto) ?? null;

    const [isInitialized, setIsInitialized] = useState(false);

    // ─── Мутації ──────────────────────────────────────────
    const { mutateAsync: updateProfile, isPending: isProfileSaving } = usePutApiMeAccountProfile();
    const { mutateAsync: updateDetails, isPending: isDetailsSaving } = usePutApiMeAccountDetails();
    const { mutateAsync: updateMarketing, isPending: isMarketingSaving } = usePutApiMeAccountMarketing();

    // ─── Локальні стейти даних ───────────────────────────
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [email, setEmail] = useState('');
    const [country, setCountry] = useState('UA'); // Дефолт на UA
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState<Gender>('Male');
    const [acceptMarketing, setAcceptMarketing] = useState(false);

    // 🚨 Стейт для зберігання помилок валідації від бекенду
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (me && !isInitialized) {
            setName(me.profile?.firstName ?? '');
            setBio(me.profile?.bio ?? '');
            setEmail(me.email ?? '');
            setCountry(me.profile?.country ?? 'UA');
            setAcceptMarketing((me as any).acceptMarketing ?? false);

            if (me.profile?.dateOfBirth) {
                setDob(me.profile.dateOfBirth.substring(0, 10));
            }
            if (me.profile?.gender) {
                setGender(me.profile.gender as Gender);
            }
            setIsInitialized(true);
        }
    }, [me, isInitialized]);

    if (isLoading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '40vh' }}>
                <div className="spinner-border spinner-border-sm text-secondary" role="status" />
            </div>
        );
    }

    // ─── Хендлери відправки даних ────────────────────────

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors({});
        setSuccessMessage(null);

        try {
            await updateProfile({
                data: {
                    name: name,
                    bio: bio,
                    avatarFileId: undefined,
                    bannerFileId: undefined
                }
            });
            await queryClient.invalidateQueries({ queryKey: getGetApiAuthMeQueryKey() });
            triggerSuccess('Public profile updated!');
        } catch (err: any) {
            if (err.response?.data?.errors) {
                setValidationErrors(err.response.data.errors);
            }
        }
    };

    const handleSaveDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationErrors({}); // Скидаємо минулі помилки перед запитом
        setSuccessMessage(null);

        try {
            await updateDetails({
                data: {
                    email,
                    country, // Тепер сюди завжди полетить чистий ISO-код (наприклад, "UA")
                    dateOfBirth: dob ? new Date(dob).toISOString() : undefined,
                    gender,
                    acceptMarketing
                }
            });
            await queryClient.invalidateQueries({ queryKey: getGetApiAuthMeQueryKey() });
            triggerSuccess('Account details successfully saved.');
        } catch (err: any) {
            if (err.response?.data?.errors) {
                setValidationErrors(err.response.data.errors);
            }
        }
    };

    const handleSaveMarketing = async () => {
        const nextState = !acceptMarketing;
        setAcceptMarketing(nextState);
        try {
            await updateMarketing({ data: { acceptMarketing: nextState } });
            await queryClient.invalidateQueries({ queryKey: getGetApiAuthMeQueryKey() });
        } catch (err) { console.error(err); }
    };

    const triggerSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 4000);
    };

    return (
        <div className="account-profile-edit">
            <header className="profile-edit-header mb-5">
                <p className="h3 fw-bold text-white mb-1">Edit profile</p>
                <p className="text-secondary small">Set up your public identity canvas and secure primary credentials.</p>
            </header>

            <div className="d-flex flex-column gap-5">

                {/* СЕКЦІЯ 1: ПУБЛИЧНИЙ ПРОФИЛЬ */}
                <section className="profile-section-card">
                    <h4 className="section-title mb-4">Public Info</h4>
                    <form onSubmit={handleSaveProfile} className="d-flex flex-column gap-4">

                        {/* Ім'я */}
                        <div className="input-group-custom">
                            <label className="input-label">Display Name</label>
                            <input
                                type="text"
                                className={`minimal-input ${validationErrors.Name ? 'input-error-state' : ''}`}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your public name"
                            />
                            {validationErrors.Name?.map(err => (
                                <span key={err} className="inline-error-text">{err}</span>
                            ))}
                        </div>

                        {/* Біографія */}
                        <div className="input-group-custom">
                            <label className="input-label">Bio</label>
                            <textarea
                                className={`minimal-input minimal-textarea ${validationErrors.Bio ? 'input-error-state' : ''}`}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell the world about your music taste..."
                                rows={3}
                            />
                            {validationErrors.Bio?.map(err => (
                                <span key={err} className="inline-error-text">{err}</span>
                            ))}
                        </div>

                        <div className="d-flex justify-content-end">
                            <button type="submit" className="yuviron-btn-minimal" disabled={isProfileSaving}>
                                {isProfileSaving ? 'Saving...' : 'Save Public Profile'}
                            </button>
                        </div>
                    </form>
                </section>

                <hr className="border-secondary my-0" style={{ opacity: 0.03 }} />

                {/* СЕКЦІЯ 2: ДЕТАЛІ АККАУНТА */}
                <section className="profile-section-card">
                    <h4 className="section-title mb-4">Account Details</h4>
                    <form onSubmit={handleSaveDetails} className="d-flex flex-column gap-4">

                        {/* Email з перевіркою помилки */}
                        <div className="input-group-custom">
                            <label className="input-label">Email Address</label>
                            <input
                                type="email"
                                className={`minimal-input ${validationErrors.Email ? 'input-error-state' : ''}`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {validationErrors.Email?.map(err => (
                                <span key={err} className="inline-error-text">{err}</span>
                            ))}
                        </div>

                        <div className="row g-3">
                            {/* 🚨 КРАСИВИЙ СЕЛЕКТ КРАЇН ЗАМІСТЬ РУЧНОГО ВВОДУ */}
                            <div className="col-12 col-md-6 input-group-custom">
                                <label className="input-label">Country / Region</label>
                                <select
                                    className={`minimal-input minimal-select ${validationErrors.Country ? 'input-error-state' : ''}`}
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                >
                                    {COUNTRY_LIST.map(c => (
                                        <option key={c.code} value={c.code}>{c.name}</option>
                                    ))}
                                </select>
                                {validationErrors.Country?.map(err => (
                                    <span key={err} className="inline-error-text">{err}</span>
                                ))}
                            </div>

                            {/* Дата народження з перевіркою помилки */}
                            <div className="col-12 col-md-6 input-group-custom">
                                <label className="input-label">Date of Birth</label>
                                <input
                                    type="date"
                                    className={`minimal-input text-uppercase ${validationErrors.DateOfBirth ? 'input-error-state' : ''}`}
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                />
                                {validationErrors.DateOfBirth?.map(err => (
                                    <span key={err} className="inline-error-text">{err}</span>
                                ))}
                            </div>
                        </div>

                        {/* Вибір гендеру */}
                        <div className="input-group-custom">
                            <label className="input-label mb-2">Gender identity</label>
                            <div className="gender-segmented-wrapper">
                                {(['Male', 'Female', 'Other'] as Gender[]).map((g) => {
                                    const isSelected = gender === g;
                                    return (
                                        <button
                                            key={g}
                                            type="button"
                                            className={`gender-node-btn ${isSelected ? 'active-node' : ''}`}
                                            onClick={() => setGender(g)}
                                        >
                                            <span className={`custom-radio-circle ${isSelected ? 'checked' : ''}`} />
                                            <span className="gender-text-label">{g}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="d-flex justify-content-end">
                            <button type="submit" className="yuviron-btn-minimal" disabled={isDetailsSaving}>
                                {isDetailsSaving ? 'Saving...' : 'Save Account Details'}
                            </button>
                        </div>
                    </form>
                </section>

                <hr className="border-secondary my-0" style={{ opacity: 0.03 }} />

                {/* СЕКЦІЯ 3: МАРКЕТИНГ */}
                <section className="profile-section-card">
                    <h4 className="section-title mb-2">Marketing Communications</h4>
                    <p className="text-secondary small mb-4">Control how Yuviron shares promotional updates, processing milestones and digests.</p>

                    <div className="marketing-panel p-4 rounded-3 d-flex justify-content-between align-items-center">
                        <div className="pe-3">
                            <h6 className="fw-bold text-white mb-1">Receive marketing push notifications</h6>
                            <p className="text-secondary small mb-0">Stay updated on newly dropped editorial features and subscription offers.</p>
                        </div>

                        {/* Модерновий кастомний чекбокс */}
                        <label className="yuviron-checkbox-wrapper">
                            <input
                                type="checkbox"
                                checked={acceptMarketing}
                                onChange={handleSaveMarketing}
                                disabled={isMarketingSaving}
                            />
                            <div className="custom-checkbox-box">
                                <i className="bi bi-check-lg check-icon" />
                            </div>
                        </label>
                    </div>
                </section>

            </div>

            {successMessage && (
                <div className="yuviron-alert alert-success-toast">
                    <i className="bi bi-check-circle-fill alert-icon" />
                    <div className="alert-content">{successMessage}</div>
                </div>
            )}
        </div>
    );
};