'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
    usePostApiAdminAuthPreLogin,
    usePostApiAdminAuthLogin, postApiAdminAuthLoginResponse,
} from '@repo/api';
import { useAdminSessionStore } from '@/entities/adminSession/model/store';

// ══════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════
type Step = 'credentials' | 'otp';

type CredentialsForm = {
    email:    string;
    password: string;
};

type OtpForm = {
    code: string;
};

// ══════════════════════════════════════════════════════════
// STEP 1: Credentials
// ══════════════════════════════════════════════════════════
interface CredentialsStepProps {
    onSuccess: (email: string) => void;
}

const CredentialsStep = ({ onSuccess }: CredentialsStepProps) => {
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<CredentialsForm>();

    const { mutate: preLogin, isPending } = usePostApiAdminAuthPreLogin({
        mutation: {
            onSuccess: (_, variables) => {
                onSuccess(variables.data.email ?? '');
            },
            onError: () => {
                // однакове повідомлення для email і пароля — безпека
                setError('root', { message: 'Invalid credentials.' });
            },
        },
    });

    const onSubmit = (values: CredentialsForm) => {
        preLogin({ data: values });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {errors.root && (
                <div className="alert alert-danger py-2 mb-3 small">{errors.root.message}</div>
            )}

            <div className="mb-4">
                <label className="form-label admin-login__form-label mb-2">Email Address</label>
                <input
                    type="email"
                    className={`form-control admin-login__input${errors.email ? ' is-invalid' : ''}`}
                    placeholder="admin@gmail.com"
                    {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
            </div>

            <div className="mb-4">
                <label className="form-label admin-login__form-label mb-2">Password</label>
                <div className="position-relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        className={`form-control admin-login__input pe-5${errors.password ? ' is-invalid' : ''}`}
                        placeholder="********************"
                        {...register('password', { required: 'Password is required' })}
                    />
                    <button
                        type="button"
                        className="btn admin-login__toggle position-absolute top-50 end-0 translate-middle-y"
                        onClick={() => setShowPassword(v => !v)}
                    >
                        {showPassword ? 'Hide' : 'Show'}
                    </button>
                </div>
                {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
            </div>

            <button
                type="submit"
                className="btn btn-primary py-3 w-100 mb-4 fw-bold"
                disabled={isPending || isSubmitting}
            >
                {isPending ? 'Sending code...' : 'Continue'}
            </button>
        </form>
    );
};

// ══════════════════════════════════════════════════════════
// STEP 2: OTP verification
// ══════════════════════════════════════════════════════════
interface OtpStepProps {
    email:   string;
    onBack:  () => void;
}

const OtpStep = ({ email, onBack }: OtpStepProps) => {
    const router = useRouter();
    const setAdminAccessToken = useAdminSessionStore(s => s.setAdminAccessToken);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<OtpForm>();

    const { mutate: login, isPending } = usePostApiAdminAuthLogin({
        mutation: {
            onSuccess: (response: postApiAdminAuthLoginResponse) => {
                if (response.status !== 200) return;

                const token = response.data?.token ?? undefined;

                if (!token) {
                    setError('root', { message: 'Authorization failed: no token received.' });
                    return;
                }

                setAdminAccessToken(token);
                document.cookie = `adminToken=${token}; path=/; max-age=43200; SameSite=Strict`;
                router.push('/dashboard');
            },
            onError: () => {
                setError('code', { message: 'Invalid or expired code. Please try again.' });
            },
        },
    });

    const onSubmit = (values: OtpForm) => {
        login({ data: { email, code: values.code } });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <p className="text-secondary small mb-4">
                A 6-digit code was sent to <strong className="text-white">{email}</strong>
            </p>

            {errors.root && (
                <div className="alert alert-danger py-2 mb-3 small">{errors.root.message}</div>
            )}

            <div className="mb-4">
                <label className="form-label admin-login__form-label mb-2">Verification Code</label>
                <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className={`form-control admin-login__input text-center fs-4 letter-spacing-3${errors.code ? ' is-invalid' : ''}`}
                    placeholder="000000"
                    autoFocus
                    {...register('code', {
                        required: 'Code is required',
                        pattern:  { value: /^\d{6}$/, message: 'Must be exactly 6 digits' },
                    })}
                />
                {errors.code && <div className="invalid-feedback text-center">{errors.code.message}</div>}
            </div>

            <button
                type="submit"
                className="btn btn-primary py-3 w-100 mb-3 fw-bold"
                disabled={isPending || isSubmitting}
            >
                {isPending ? 'Verifying...' : 'Verify & Sign In'}
            </button>

            <button
                type="button"
                className="btn btn-link text-secondary w-100 small"
                onClick={onBack}
            >
                ← Back to login
            </button>
        </form>
    );
};

// ══════════════════════════════════════════════════════════
// LOGIN FORM — orchestrates 2FA steps
// ══════════════════════════════════════════════════════════
export const LoginForm = () => {
    const [step,  setStep]  = useState<Step>('credentials');
    const [email, setEmail] = useState('');

    const handleCredentialsSuccess = (submittedEmail: string) => {
        setEmail(submittedEmail);
        setStep('otp');
    };

    return (
        <>
            {step === 'credentials' && (
                <CredentialsStep onSuccess={handleCredentialsSuccess} />
            )}
            {step === 'otp' && (
                <OtpStep
                    email={email}
                    onBack={() => setStep('credentials')}
                />
            )}
        </>
    );
};