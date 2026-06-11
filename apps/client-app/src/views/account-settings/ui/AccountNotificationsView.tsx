'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    useGetApiNotificationsPreferences,
    usePutApiNotificationsPreferences,
    getGetApiNotificationsPreferencesQueryKey,
    type NotificationPreferencesDto,
    type NotificationPreferenceGroupDto,
    type NotificationPreferenceItemDto,
    type NotificationCategory
} from '@repo/api/client';

export const AccountNotificationsView = () => {
    const queryClient = useQueryClient();

    // ─── Запит налаштувань сповіщень ─────────────────────
    const { data: notifRaw, isLoading } = useGetApiNotificationsPreferences();

    const notifData = (notifRaw as { data?: NotificationPreferencesDto })?.data ?? (notifRaw as NotificationPreferencesDto);
    const groups: NotificationPreferenceGroupDto[] = Array.isArray(notifData?.groups) ? notifData.groups : [];

    // ─── Мутація оновлення ───────────────────────────────
    const { mutateAsync: updatePreference } = usePutApiNotificationsPreferences();

    // ─── Локальні стейти зворотного зв'язку ────────────────
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [localStates, setLocalStates] = useState<Record<string, boolean>>({});

    if (isLoading) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '40vh' }}>
                <div className="spinner-border spinner-border-sm text-secondary" role="status" />
            </div>
        );
    }

    // Хендлер перемикання конкретного чекбоксу
    const handleToggleChange = async (
        category: NotificationCategory | undefined,
        code: string | null | undefined,
        inputId: string,
        currentVisualState: boolean,
        itemTitle: string | null | undefined
    ) => {
        if (!category || !code) return;

        const nextState = !currentVisualState;
        setSuccessMessage(null);
        setLocalStates(prev => ({ ...prev, [inputId]: nextState }));

        try {
            await updatePreference({
                data: {
                    category,
                    code,
                    enabled: nextState
                }
            });

            // 2. Фоново оновлюємо серверний кеш
            await queryClient.invalidateQueries({ queryKey: getGetApiNotificationsPreferencesQueryKey() });

            const cleanTitle = itemTitle || code.replace(/_/g, ' ');
            triggerToast(`Preference "${cleanTitle}" successfully updated.`);
        } catch (err) {
            console.error('[Notifications] Failed to update preference:', err);


            setLocalStates(prev => ({ ...prev, [inputId]: currentVisualState }));
        }
    };

    const triggerToast = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 4000);
    };

    return (
        <div className="account-notifications-view">
            <header className="notifications-header mb-5">
                <p className="h3 fw-bold text-white mb-1">Notification settings</p>
                <p className="text-secondary small">Choose what information matters to you and pick delivery channels.</p>
            </header>

            <div className="d-flex flex-column gap-5">
                {groups.map((group: NotificationPreferenceGroupDto, gIndex: number) => {
                    if (!group.category) return null;

                    return (
                        <div key={group.category} className="notification-group-block">

                            <div className="group-meta-header d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom border-secondary-subtle" style={{ '--bs-border-opacity': 0.03 } as React.CSSProperties}>
                                <h5 className="fw-bold text-white mb-0">
                                    {group.title || `${group.category} Preferences`}
                                </h5>
                                <span className="category-marker-badge">{group.category} Mode</span>
                            </div>

                            <div className="d-flex flex-column gap-2">
                                {group.items?.map((item: NotificationPreferenceItemDto) => {
                                    if (!item.code) return null;

                                    const inputId = `notif-${group.category}-${item.code}`;

                                    // Базове значення з сервера/дефолтів
                                    const serverEvaluatedState = item.enabled ?? item.defaultEnabled ?? false;

                                    // 🚨 ФІКС: Пріоритет віддаємо локальному оптимістичному стану, якщо він є
                                    const isItemChecked = localStates[inputId] ?? serverEvaluatedState;

                                    return (
                                        <div
                                            key={item.code}
                                            className="notification-item-row d-flex justify-content-between align-items-center p-3 rounded-3"
                                        >
                                            <div className="pe-3">
                                                <h6 className="fw-semibold text-white mb-1" style={{ fontSize: '14px', letterSpacing: '-0.1px' }}>
                                                    {item.title || item.code.replace(/_/g, ' ')}
                                                </h6>
                                                {item.isCategoryDefault && (
                                                    <span className="text-secondary font-monospace d-block" style={{ fontSize: '10px', opacity: 0.5 }}>
                                                        ⚙️ Inherited from profile global matrices
                                                    </span>
                                                )}
                                            </div>

                                            <label className="yuviron-checkbox-wrapper">
                                                <input
                                                    type="checkbox"
                                                    id={inputId}
                                                    checked={isItemChecked}
                                                    // 🚨 Передаємо розрахований `isItemChecked`, щоб інверсія працювала бездоганно
                                                    onChange={() => handleToggleChange(group.category, item.code, inputId, isItemChecked, item.title)}
                                                />
                                                <div className="custom-checkbox-box">
                                                    <i className="bi bi-check-lg check-icon" />
                                                </div>
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>

                            {gIndex < groups.length - 1 && (
                                <hr className="border-secondary mt-5 mb-0" style={{ opacity: 0.02 }} />
                            )}
                        </div>
                    );
                })}
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