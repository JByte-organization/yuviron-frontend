import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { usePostApiAdminAuthLogin, postApiAdminAuthLoginResponse, LoginResponse } from '@repo/api/admin.ts';
import { useAdminSessionStore } from '@/entities/adminSession/model/store';
import { FormInput } from './components/FormInput';
import { useRouter } from 'next/navigation';

type Props = { email: string; onBack: () => void };

export const OtpStep: React.FC<Props> = React.memo(({ email, onBack }) => {
    const router = useRouter();
    const setAdminAccessToken = useAdminSessionStore(s => s.setAdminAccessToken);

    const { register, handleSubmit, setError, formState: { errors } } = useForm<{ code: string }>();
    const { mutate: login, isPending } = usePostApiAdminAuthLogin({
        mutation: {
            onSuccess: (res: postApiAdminAuthLoginResponse) => {
                const payload = res as unknown as LoginResponse;
                const token = payload.token;
                if (!token) {
                    setError('root', { message: 'Authorization failed: no token received.' });
                    return;
                }

                // Zustand
                setAdminAccessToken(token);

                // Временные куку для Middleware
                document.cookie = "admin_logged_in=true; path=/; max-age=86400; SameSite=Strict";

                router.push('/dashboard');
            },
            onError: () => setError('code', { message: 'Invalid or expired code. Please try again.' }),
        },
    });

    const onSubmit = useCallback((vals: { code: string }) => login({ data: { email, code: vals.code } }), [login, email]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <p className="text-secondary small mb-4">A 6-digit code was sent to <strong className="text-white">{email}</strong></p>
            {errors.root && <div className="alert alert-danger py-2 mb-3 small">{errors.root.message}</div>}
            <FormInput label="Verification Code" placeholder="000000" autoFocus inputMode="numeric" maxLength={6} className="text-center fs-4 letter-spacing-3" {...register('code', { required: 'Code is required', pattern: { value: /^\d{6}$/, message: 'Must be exactly 6 digits' } })} error={errors.code?.message} containerClassName="mb-4" />
            <button type="submit" className="btn btn-primary py-3 w-100 mb-3 fw-bold" disabled={isPending}>{isPending ? 'Verifying...' : 'Verify & Sign In'}</button>
            <button type="button" className="btn btn-link text-secondary w-100 small" onClick={onBack}>← Back to login</button>
        </form>
    );
});
OtpStep.displayName = 'OtpStep';