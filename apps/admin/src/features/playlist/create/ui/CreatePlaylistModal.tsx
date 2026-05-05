'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { usePostApiAdminPlaylists, PlaylistVisibility } from '@repo/api';
import { AsyncSelect, type SelectOption } from '@/shared/ui/AsyncSelect/AsyncSelect';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onSearchUsers: (term: string) => Promise<SelectOption[]>;
}

type FormValues = {
    title: string;
    description: string;
    coverUrl: string;
    visibility: string;
    isEditorial: boolean;
};

export const CreatePlaylistModal = ({ isOpen, onClose, onSuccess, onSearchUsers }: Props) => {
    const {
        register, handleSubmit, setError, reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        defaultValues: {
            visibility: PlaylistVisibility.Public,
            isEditorial: false,
        },
    });

    const [owner, setOwner] = React.useState<SelectOption[]>([]);
    const { mutateAsync: createPlaylist, isPending } = usePostApiAdminPlaylists();

    const onSubmit = async (values: FormValues) => {
        try {
            await createPlaylist({
                data: {
                    title:       values.title,
                    description: values.description || null,
                    coverUrl:    values.coverUrl || null,
                    visibility:  values.visibility as any,
                    isEditorial: values.isEditorial,
                    ownerUserId: owner[0]?.id || null,
                },
            });
            reset();
            setOwner([]);
            onSuccess();
            onClose();
        } catch (error: any) {
            const status = error.response?.status;
            const serverErrors = error.response?.data?.errors;
            if (status === 400 && serverErrors) {
                Object.keys(serverErrors).forEach(field => {
                    const key = (field.charAt(0).toLowerCase() + field.slice(1)) as keyof FormValues;
                    setError(key, { type: 'server', message: serverErrors[field]?.[0] });
                });
            } else {
                setError('root', { message: `Error ${status}: Failed to create playlist.` });
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">

                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold text-cyan">Create Playlist</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="modal-body p-4" style={{ overflowY: 'auto', maxHeight: '70vh' }}>

                            {errors.root && (
                                <div className="alert alert-danger py-2 mb-3">{errors.root.message}</div>
                            )}

                            {/* Title */}
                            <div className="mb-4">
                                <label className="form-label admin-text small fw-bold">TITLE *</label>
                                <input
                                    type="text"
                                    className={`form-control admin-login__input ${errors.title ? 'is-invalid' : ''}`}
                                    {...register('title', { required: 'Title is required' })}
                                />
                                {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <label className="form-label admin-text small fw-bold">DESCRIPTION</label>
                                <textarea
                                    className="form-control admin-login__input h-auto py-3"
                                    rows={3}
                                    {...register('description')}
                                />
                            </div>

                            <div className="row">
                                {/* Visibility */}
                                <div className="col-md-6 mb-4">
                                    <label className="form-label admin-text small fw-bold">VISIBILITY</label>
                                    <select
                                        className="form-select admin-login__input text-white"
                                        {...register('visibility')}
                                    >
                                        {Object.values(PlaylistVisibility).map(v => (
                                            <option key={v} value={v}>{v}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Cover */}
                                <div className="col-md-6 mb-4">
                                    <label className="form-label admin-text small fw-bold">COVER PATH</label>
                                    <input
                                        type="text"
                                        className="form-control admin-login__input text-secondary"
                                        placeholder="covers/example.jpg"
                                        {...register('coverUrl')}
                                    />
                                </div>
                            </div>

                            {/* Editorial */}
                            <div className="mb-4 form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="create-editorial"
                                    {...register('isEditorial')}
                                />
                                <label className="form-check-label text-secondary small" htmlFor="create-editorial">
                                    Editorial playlist
                                </label>
                            </div>

                            {/* Owner — одиночный выбор */}
                            <AsyncSelect
                                label="OWNER (USER)"
                                placeholder="Search user..."
                                selected={owner}
                                onChange={(items) => setOwner(items.slice(-1))}
                                onSearch={onSearchUsers}
                            />

                        </div>

                        <div className="modal-footer border-0 p-4">
                            <button type="button" className="btn btn-admin-dark px-4" onClick={onClose}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary px-5 fw-bold"
                                disabled={isPending || isSubmitting}
                            >
                                {isPending ? 'Creating...' : 'Create Playlist'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};