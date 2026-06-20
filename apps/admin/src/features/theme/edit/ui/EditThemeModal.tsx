'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { usePutApiAdminThemesId, type UpdateThemeCommand, type ThemeListItemDto } from '@repo/api/admin.ts';

interface Props { theme: ThemeListItemDto; isOpen: boolean; onClose: () => void; onSuccess: () => void; }

export const EditThemeModal = ({ theme, isOpen, onClose, onSuccess }: Props) => {
    const { register, handleSubmit, watch, setError, formState: { errors } } = useForm<UpdateThemeCommand>({
        mode: 'onChange',
        defaultValues: {
            themeId: theme.id,
            name: theme.name,
            primaryColor: theme.primaryColor || '#7AE0FF',
            secondaryColor: theme.secondaryColor || '#1D4ED8',
            backgroundColor: theme.backgroundColor || '#0B0C12',
            isPremiumOnly: theme.isPremiumOnly ?? true
        }
    });

    const { mutateAsync: updateTheme, isPending } = usePutApiAdminThemesId();

    const currentPrimary = watch('primaryColor') || '#000';
    const currentSecondary = watch('secondaryColor') || '#000';
    const currentBg = watch('backgroundColor') || '#000';

    const onSubmit = async (values: UpdateThemeCommand) => {
        if (!theme.id) return;
        try {
            await updateTheme({
                id: theme.id,
                data: {
                    themeId: theme.id,
                    name: values.name?.trim() || null,
                    primaryColor: values.primaryColor?.toUpperCase() || null,
                    secondaryColor: values.secondaryColor?.toUpperCase() || null,
                    backgroundColor: values.backgroundColor?.toUpperCase() || null,
                    isPremiumOnly: !!values.isPremiumOnly
                }
            });
            onSuccess();
        } catch {
            setError('root', { message: 'Failed to update configuration nodes.' });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content bg-admin-primary border border-secondary text-white shadow-lg">
                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold text-info">Modify Theme Vector: {theme.name}</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={isPending} />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="modal-body p-4 d-flex flex-column gap-4">
                            {errors.root && <div className="alert alert-danger py-2 small">{errors.root.message}</div>}

                            <div className="row g-3">
                                <div className="col-md-8">
                                    <label className="form-label text-secondary small fw-bold">THEME UNIQUE TITLE *</label>
                                    <input type="text" className={`form-control admin-login__input ${errors.name ? 'is-invalid' : ''}`} {...register('name', { required: 'Theme title required' })} disabled={isPending} />
                                </div>
                                <div className="col-md-4 d-flex align-items-end pb-2">
                                    <label className="form-check-label text-white small fw-semibold cursor-pointer d-flex align-items-center gap-2">
                                        <input type="checkbox" className="form-check-input bg-dark border-secondary shadow-none m-0" {...register('isPremiumOnly')} disabled={isPending} />
                                        Gated Premium Only 💎
                                    </label>
                                </div>
                            </div>

                            <div className="row align-items-center g-4">
                                <div className="col-md-6">
                                    <label className="form-label text-secondary small fw-bold">LIVE VECTOR CHANNELS VIEWPORT</label>
                                    <div
                                        className="rounded-3 border border-secondary border-opacity-30 p-4 d-flex align-items-end"
                                        style={{
                                            background: `linear-gradient(135deg, ${currentBg} 0%, ${currentSecondary} 50%, ${currentPrimary} 100%)`,
                                            minHeight: '145px',
                                            transition: 'background 0.3s ease'
                                        }}
                                    >
                                        <div>
                                            <span className="d-block fw-bold text-white small">Altered Client Matrix</span>
                                            <span className="text-white-50 font-monospace" style={{ fontSize: '10px' }}>
        ID Node: {theme.id?.slice(0, 8) ?? '—'}...
    </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6 d-flex flex-column gap-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="color-input-circle-wrapper"><input type="color" {...register('primaryColor')} disabled={isPending} /></div>
                                        <span className="small text-secondary fw-bold">Primary Accent</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="color-input-circle-wrapper"><input type="color" {...register('secondaryColor')} disabled={isPending} /></div>
                                        <span className="small text-secondary fw-bold">Dynamic Ambient Fog</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="color-input-circle-wrapper"><input type="color" {...register('backgroundColor')} disabled={isPending} /></div>
                                        <span className="small text-secondary fw-bold">Deep Ground Base</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer border-secondary border-opacity-20 p-4">
                            <button type="button" className="btn btn-admin-dark px-4" onClick={onClose} disabled={isPending}>Cancel</button>
                            <button type="submit" className="btn btn-info text-dark px-5 fw-bold" disabled={isPending}>Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};