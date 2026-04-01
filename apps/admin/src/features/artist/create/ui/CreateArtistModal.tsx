'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    usePostApiAdminArtists,
    usePostApiFilesUpload,
    useGetApiAdminUsers,
    VerificationStatus,
    CreateArtistCommand
} from '@repo/api';
import { useDebounce } from '@/shared/lib/hooks/useDebounce';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateArtistModal = ({ isOpen, onClose, onSuccess }: Props) => {
    // 1. Инициализация формы через React Hook Form
    const { register, handleSubmit, setValue, watch, reset, setError, formState: { errors } } = useForm<CreateArtistCommand>({
        defaultValues: {
            name: '',
            bio: '',
            avatarUrl: '',
            bannerUrl: '',
            verificationStatus: VerificationStatus.None,
            ownerUserId: ''
        }
    });

    // Следим за значениями для UI
    const ownerUserId = watch('ownerUserId');
    const avatarUrl = watch('avatarUrl');
    const bannerUrl = watch('bannerUrl');

    // 2. Поиск владельца (Owner)
    const [userSearch, setUserSearch] = useState('');
    const debouncedSearch = useDebounce(userSearch, 500);

    const { data: usersData, isLoading: isUsersLoading } = useGetApiAdminUsers({
        // @ts-ignore - Используем PascalCase для параметров запроса
        SearchTerm: debouncedSearch,
        PageSize: 5
    } as any);

    // Извлекаем список юзеров, учитывая возможный PascalCase в ответе
    const users = (usersData as any)?.Items || (usersData as any)?.items || [];

    // 3. Загрузка файлов (Паттерн Временной Зоны)
    const { mutateAsync: uploadFile, isPending: isUploading } = usePostApiFilesUpload();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'bannerUrl') => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // Мутатор возвращает данные напрямую
            const response = await uploadFile({ data: { file, folder: 'artists' } });
            // Проверяем PascalCase (.Path) согласно твоим ошибкам
            const path = (response as any).Path || (response as any).path;

            if (path) {
                setValue(field, path); // Записываем temp/... в форму
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert("Ошибка сети при загрузке. Проверьте NEXT_PUBLIC_API_URL и CORS.");
        }
    };

    // 4. Создание артиста
    const { mutate: createArtist, isPending: isSaving } = usePostApiAdminArtists({
        mutation: {
            onSuccess: () => {
                onSuccess();
                handleClose();
            },
            onError: (error: any) => {
                // Обработка ошибок валидации 400 Bad Request
                if (error.response?.status === 400 && error.response.data?.errors) {
                    const backendErrors = error.response.data.errors;
                    Object.keys(backendErrors).forEach((field) => {
                        // Маппим PascalCase бэкенда в camelCase формы
                        const fieldName = (field.charAt(0).toLowerCase() + field.slice(1)) as any;
                        setError(fieldName, { type: 'server', message: backendErrors[field][0] });
                    });
                } else {
                    alert(error.response?.data?.title || "Ошибка при сохранении");
                }
            }
        }
    });

    const handleClose = () => {
        reset();
        setUserSearch('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal d-block shadow" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content bg-dark border-secondary text-white">
                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold">Create Artist Profile</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
                    </div>

                    <form onSubmit={handleSubmit((data) => createArtist({ data }))}>
                        <div className="modal-body p-4">
                            <div className="row g-4">
                                <div className="col-md-7">
                                    {/* OWNER SEARCH */}
                                    <div className="mb-4 position-relative">
                                        <label className="form-label small fw-bold text-secondary">OWNER (SEARCH BY EMAIL)</label>
                                        <input
                                            type="text"
                                            className={`form-control bg-transparent border-secondary text-white ${errors.ownerUserId ? 'is-invalid' : ''}`}
                                            placeholder="Type email to search..."
                                            value={userSearch}
                                            onChange={e => setUserSearch(e.target.value)}
                                        />
                                        {/* Dropdown результатов */}
                                        {userSearch.length > 2 && users.length > 0 && (
                                            <div className="list-group position-absolute w-100 shadow-lg mt-1" style={{ zIndex: 1100 }}>
                                                {users.map((user: any) => (
                                                    <button
                                                        key={user.Id || user.id} type="button"
                                                        className={`list-group-item list-group-item-action bg-secondary text-white border-dark ${ownerUserId === (user.Id || user.id) ? 'active bg-primary' : ''}`}
                                                        onClick={() => {
                                                            setValue('ownerUserId', user.Id || user.id);
                                                            setUserSearch(user.Email || user.email);
                                                        }}
                                                    >
                                                        {user.DisplayName || user.displayName} <small className="opacity-50">({user.Email || user.email})</small>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {errors.ownerUserId && <div className="invalid-feedback">{errors.ownerUserId.message}</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-secondary">ARTIST NAME</label>
                                        <input
                                            {...register('name', { required: 'Имя обязательно' })}
                                            className={`form-control bg-transparent border-secondary text-white ${errors.name ? 'is-invalid' : ''}`}
                                        />
                                        {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                                    </div>

                                    <div className="mb-0">
                                        <label className="form-label small fw-bold text-secondary">BIOGRAPHY</label>
                                        <textarea
                                            {...register('bio')}
                                            className="form-control bg-transparent border-secondary text-white" rows={4}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-5">
                                    {/* FILES */}
                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-secondary">AVATAR</label>
                                        <input type="file" className="form-control form-control-sm bg-transparent border-secondary text-white"
                                               accept="image/*" onChange={e => handleFileUpload(e, 'avatarUrl')} />
                                        {avatarUrl && <div className="text-success small mt-1">✓ Image uploaded to temp</div>}
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-secondary">BANNER</label>
                                        <input type="file" className="form-control form-control-sm bg-transparent border-secondary text-white"
                                               accept="image/*" onChange={e => handleFileUpload(e, 'bannerUrl')} />
                                    </div>

                                    <div className="mb-0">
                                        <label className="form-label small fw-bold text-secondary">VERIFICATION STATUS</label>
                                        <select
                                            {...register('verificationStatus')}
                                            className="form-select bg-transparent border-secondary text-white"
                                        >
                                            <option value={VerificationStatus.None} className="bg-dark text-white">None</option>
                                            <option value={VerificationStatus.Pending} className="bg-dark text-white">Pending</option>
                                            <option value={VerificationStatus.Verified} className="bg-dark text-white">Verified</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer border-secondary p-4">
                            <button type="button" className="btn btn-outline-secondary px-4" onClick={handleClose}>Cancel</button>
                            <button
                                type="submit"
                                className="btn btn-primary px-5 fw-bold"
                                disabled={isSaving || isUploading || !ownerUserId}
                            >
                                {isSaving ? 'Creating...' : 'Create Artist'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};