'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    useGetApiMeSecurityDevices,
    useDeleteApiMeSecurityDevicesId,
    usePostApiMeSecurityLogoutEverywhere,
    usePostApiMeSecurityChangePassword,
    getGetApiMeSecurityDevicesQueryKey, // 🚨 Импортируем правильный ключ кеша для мгновенного обновления
    type UserDeviceDto
} from '@repo/api/client';

export const AccountSecurityView = () => {
    const queryClient = useQueryClient();

    // ─── Запросы данных с сервера ───────────────────────────
    const { data: devicesRaw, isLoading: isDevicesLoading } = useGetApiMeSecurityDevices();
    const devices = devicesRaw && Array.isArray(devicesRaw.data) ? devicesRaw.data : [];

    // ─── Мутации безопасности ──────────────────────────────────
    const { mutateAsync: changePassword, isPending: isPasswordSaving } = usePostApiMeSecurityChangePassword();
    const { mutateAsync: revokeDevice, isPending: isRevoking } = useDeleteApiMeSecurityDevicesId();
    const { mutateAsync: logoutEverywhere, isPending: isLoggingOutEverywhere } = usePostApiMeSecurityLogoutEverywhere();

    // ─── Локальные стейты ──────────────────────────────────
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [errorAlert, setErrorAlert] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    // ─── Хендлеры событий ───────────────────────────────────

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorAlert(null);
        setSuccessMessage(null);

        if (newPassword !== confirmPassword) {
            setErrorAlert('New passwords do not match.');
            return;
        }

        try {
            await changePassword({
                data: { oldPassword, newPassword }
            });
            triggerSuccess('Password successfully updated!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setErrorAlert('Failed to change password. Please verify your current password.');
        }
    };

    const handleRevokeDevice = async (id: string) => {
        setErrorAlert(null);
        try {
            await revokeDevice({ id });
            // 🚨 НАДЕЖНОЕ ОБНОВЛЕНИЕ: Инвалидируем кеш по строгому ключу Orval
            await queryClient.invalidateQueries({ queryKey: getGetApiMeSecurityDevicesQueryKey() });
            triggerSuccess('Device session successfully revoked.');
        } catch (err) {
            setErrorAlert('Failed to terminate device session.');
        }
    };

    const handleLogoutEverywhereClick = () => {
        setErrorAlert(null);
        setIsConfirmModalOpen(true);
    };

    // 3. А эта функция вызывается уже внутри поп-ап окна при нажатии "Confirm":
    const executeLogoutEverywhere = async () => {
        setIsConfirmModalOpen(false); // Закрываем окно
        setErrorAlert(null);
        try {
            await logoutEverywhere();
            triggerSuccess('Successfully logged out from all concurrent sessions.');
            setTimeout(() => {
                window.location.href = '/login'; // Полная зачистка сессии на клиенте
            }, 1500);
        } catch (err) {
            setErrorAlert('Global logout request failed.');
        }
    };

    const triggerSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 4000);
    };

    return (
        <div className="account-security-edit">
            <header className="security-edit-header mb-5">
                <p className="h3 fw-bold text-white mb-1">Change password & Security</p>
                <p className="text-secondary small">Manage concurrent authorization tokens, look up active IPs and update access keys.</p>
            </header>

            <div className="d-flex flex-column gap-5">

                {/* СЕКЦИЯ 1: ЗМІНА ПАРОЛЮ */}
                <section className="security-section-card">
                    <h4 className="section-title mb-4">Update Security Password</h4>

                    {/* Контекстное премиальное окно ошибки внутри формы */}
                    {errorAlert && (
                        <div className="yuviron-alert alert-danger animate-fade-in">
                            <i className="bi bi-exclamation-circle-fill alert-icon" />
                            <div className="alert-content">{errorAlert}</div>
                        </div>
                    )}

                    <form onSubmit={handlePasswordSubmit} className="d-flex flex-column gap-4" style={{ maxWidth: '440px' }}>
                        <div className="input-group-custom">
                            <label className="input-label">Current Password</label>
                            <input
                                type="password"
                                className="minimal-input"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group-custom">
                            <label className="input-label">New Password</label>
                            <input
                                type="password"
                                className="minimal-input"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group-custom">
                            <label className="input-label">Confirm New Password</label>
                            <input
                                type="password"
                                className="minimal-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="d-flex justify-content-start mt-2">
                            <button
                                type="submit"
                                className="yuviron-btn-minimal" /* 🚨 Наш фирменный стиль кнопок */
                                disabled={isPasswordSaving}
                            >
                                {isPasswordSaving ? 'Updating...' : 'Set New Password'}
                            </button>
                        </div>
                    </form>
                </section>

                <hr className="border-secondary my-0" style={{ opacity: 0.03 }} />

                {/* СЕКЦІЯ 2: СПИСОК АКТИВНИХ ПРИСТРОЇВ */}
                <section className="security-section-card">
                    <h4 className="section-title mb-1">Where you`re logged in</h4>
                    <p className="text-secondary small mb-4">We show a list of devices that currently hold valid session cookies to your client app.</p>

                    {isDevicesLoading ? (
                        <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                    ) : (
                        <div className="d-flex flex-column gap-2">
                            {devices.map((device: UserDeviceDto) => {
                                if (!device.id) return null;
                                return (
                                    <div key={device.id} className="device-session-row d-flex justify-content-between align-items-center p-3 rounded-3">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="device-icon-wrapper">
                                                <i className={`bi ${device.browserName?.toLowerCase().includes('mobile') ? 'bi-phone' : 'bi-laptop'} text-white fs-5`} />
                                            </div>
                                            <div>
                                                <h6 className="fw-bold text-white mb-0.5">
                                                    {device.deviceName || 'Unknown Device'} • {device.browserName || 'Web App'}
                                                </h6>
                                                <div className="d-flex align-items-center gap-2 text-secondary font-monospace" style={{ fontSize: '11px' }}>
                                                    <span>IP: {device.lastIpAddress || '0.0.0.0'}</span>
                                                    <span>•</span>
                                                    <span>Last seen: {device.lastUsedAt ? new Date(device.lastUsedAt).toLocaleString() : 'Just now'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Элегантная деликатная экшн-кнопка отзыва сессии */}
                                        <button
                                            type="button"
                                            className="device-revoke-trigger-btn"
                                            onClick={() => handleRevokeDevice(device.id!)}
                                            disabled={isRevoking}
                                        >
                                            Revoke
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <hr className="border-secondary my-0" style={{ opacity: 0.03 }} />

                {/* СЕКЦИЯ 3: LOGOUT EVERYWHERE */}
                <section className="security-section-card">
                    <h4 className="section-title text-danger mb-1">Logout Everywhere</h4>
                    <p className="text-secondary small mb-4">Sign out of all active Yuviron sessions across mobile web layouts, desktop clients, or automated GitLab test environments.</p>

                    <button
                        type="button"
                        className="yuviron-btn-danger-minimal"
                        onClick={handleLogoutEverywhereClick}
                        disabled={isLoggingOutEverywhere}
                    >
                        {isLoggingOutEverywhere ? 'Revoking Access...' : 'Sign out everywhere'}
                    </button>
                </section>

            </div>

            {successMessage && (
                <div className="yuviron-alert alert-success-toast">
                    <i className="bi bi-check-circle-fill alert-icon" />
                    <div className="alert-content">{successMessage}</div>
                </div>
            )}

            {isConfirmModalOpen && (
                <div className="yuviron-modal-overlay">
                    <div className="yuviron-modal-card animate-fade-in">
                        <div className="modal-card-header text-center mb-3">
                            <div className="modal-danger-icon-badge mb-3">
                                <i className="bi bi-exclamation-triangle-fill" />
                            </div>
                            <h5 className="fw-bold text-white mb-2">Sign out everywhere?</h5>
                            <p className="text-secondary small px-2">
                                This action will immediately revoke all active authorization tokens. You will be forced to re-authenticate on all devices.
                            </p>
                        </div>

                        <div className="d-flex flex-column gap-2 mt-4">
                            <button
                                type="button"
                                className="yuviron-btn-danger-minimal w-100 py-2.5"
                                onClick={executeLogoutEverywhere}
                            >
                                Confirm & Disconnect
                            </button>
                            <button
                                type="button"
                                className="yuviron-btn-subtle w-100 py-2.5"
                                onClick={() => setIsConfirmModalOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};