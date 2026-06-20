'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { usePostApiAdminPlans, PlanPeriod, PlanType } from '@repo/api/admin.ts';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type FormValues = {
    name: string;
    price: number;
    currency: string;
    period: typeof PlanPeriod[keyof typeof PlanPeriod];
};

export const CreatePlanModal = ({ isOpen, onClose, onSuccess }: Props) => {
    const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({
        mode: 'onChange',
        defaultValues: {
            name: '',
            price: 0,
            currency: 'USD',
            period: PlanPeriod.Month,
        }
    });

    const { mutateAsync: createPlan, isPending } = usePostApiAdminPlans();

    const onSubmit = async (values: FormValues) => {
        try {
            await createPlan({
                data: {
                    name: values.name.trim(),
                    price: Number(values.price),
                    currency: values.currency,
                    period: values.period,
                }
            });
            onSuccess();
            onClose();
            reset();
        } catch (error: any) {
            const serverErrors = error.response?.data?.errors;
            if (serverErrors) {
                Object.keys(serverErrors).forEach((field) => {
                    const key = (field.charAt(0).toLowerCase() + field.slice(1)) as keyof FormValues;
                    setError(key, { type: 'server', message: serverErrors[field]?.[0] });
                });
            } else {
                setError('root', { message: 'Failed to deploy new subscription blueprint.' });
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content bg-admin-primary border border-secondary shadow-lg text-white">
                    <div className="modal-header border-secondary p-4">
                        <h5 className="modal-title fw-bold text-cyan">Create Premium Tier</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} />
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="modal-body p-4 d-flex flex-column gap-3">
                            {errors.root && <div className="alert alert-danger py-2 small">{errors.root.message}</div>}

                            <div>
                                <label className="form-label text-secondary small fw-bold">PLAN NAME *</label>
                                <input
                                    type="text"
                                    className={`form-control admin-login__input ${errors.name ? 'is-invalid' : ''}`}
                                    placeholder="e.g. Premium Family"
                                    {...register('name', { required: 'Plan name allocation is required' })}
                                />
                                {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <label className="form-label text-secondary small fw-bold">PRICE AMOUNT *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className={`form-control admin-login__input font-monospace ${errors.price ? 'is-invalid' : ''}`}
                                        {...register('price', { required: true, min: 0 })}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label text-secondary small fw-bold">CURRENCY *</label>
                                    <select className="form-select admin-login__input text-white" {...register('currency')}>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="UAH">UAH (₴)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <label className="form-label text-secondary small fw-bold">BILLING CYCLE</label>
                                    <select className="form-select admin-login__input text-white" {...register('period')}>
                                        <option value={PlanPeriod.Month}>Monthly</option>
                                        <option value={PlanPeriod.Year}>Yearly</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer border-0 p-4">
                            <button type="button" className="btn btn-admin-dark px-4" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary px-5 fw-bold" disabled={isPending || isSubmitting}>
                                {isPending ? 'Deploying...' : 'Deploy Plan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};