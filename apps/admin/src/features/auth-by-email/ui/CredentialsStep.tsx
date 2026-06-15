import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { usePostApiAdminAuthPreLogin } from '@repo/api/admin.ts';
import { FormInput } from './components/FormInput';

type Props = { onSuccess: (email: string) => void };

export const CredentialsStep: React.FC<Props> = React.memo(({ onSuccess }) => {
    const { register, handleSubmit, setError, formState: { errors } } = useForm<{ email: string; password: string }>();
    const { mutate: preLogin, isPending } = usePostApiAdminAuthPreLogin({
        mutation: {
            onSuccess: (_, vars) => onSuccess(vars.data.email ?? ''),
            onError: () => setError('root', { message: 'Invalid credentials.' }),
        },
    });

    const onSubmit = useCallback((vals: { email: string; password: string }) => preLogin({ data: vals }), [preLogin]);

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {errors.root && <div className="alert alert-danger py-2 mb-3 small">{errors.root.message}</div>}
            <FormInput label="Email Address" placeholder="admin@gmail.com" type="email" {...register('email', { required: 'Email is required' })} error={errors.email?.message} containerClassName="mb-4" />
            <FormInput label="Password" placeholder="********************" type="password" {...register('password', { required: 'Password is required' })} error={errors.password?.message} containerClassName="mb-4" />
            <button type="submit" className="btn btn-primary py-3 w-100 mb-4 fw-bold" disabled={isPending}>{isPending ? 'Sending code...' : 'Continue'}</button>
        </form>
    );
});
CredentialsStep.displayName = 'CredentialsStep';