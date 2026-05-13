'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePostApiAuthLogin } from '@repo/api';
import { useSessionStore } from '@/entities/session/model/store';

export const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();

    // Используем наш новый метод setAuth
    const setAuth = useSessionStore((state) => state.setAuth);

    const { mutate, isPending } = usePostApiAuthLogin({
        mutation: {
            onSuccess: (response: any) => {
                const data = response?.data ?? response;
                const token = data?.token;
                const permissions = data?.permissions || [];

                // Перевіряємо наявність права на вхід в адмінку
                const isAdmin = permissions.includes('AccessAdminPanel');

                if (token && isAdmin) {
                    // Записуємо роль як 'admin', щоб наш Middleware її розпізнав
                    setAuth(token, 'admin');
                    router.push('/dashboard');
                } else if (token && !isAdmin) {
                    setErrorMessage('У вас немає прав для доступу до адмін-панелі.');
                    setAuth(null, null);
                } else {
                    setErrorMessage('Помилка авторизації: токен не отримано.');
                }
            },
            onError: (error: any) => {
                const message = error?.message ?? 'Неверный email или пароль.';
                setErrorMessage(message);
            },
        },
    });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        mutate({ data: { email, password } });
    };

    return (
        <form onSubmit={handleLogin}>
            {errorMessage && (
                <div className="alert alert-danger py-2 mb-3 small" role="alert">
                    {errorMessage}
                </div>
            )}

            <div className="mb-4">
                <label htmlFor="email" className="form-label admin-login__form-label mb-2">
                    Email Address
                </label>
                <input
                    id="email"
                    type="email"
                    className="form-control admin-login__input"
                    placeholder="admin@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="mb-4">
                <label htmlFor="password" className="form-label admin-login__form-label mb-2">
                    Password
                </label>
                <div className="position-relative">
                    <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        className="form-control admin-login__input pe-5"
                        placeholder="********************"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        className="btn admin-login__toggle position-absolute top-50 end-0 translate-middle-y"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? 'Hide' : 'Show'}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                className="btn btn-primary py-3 w-100 mb-4 fw-bold"
                disabled={isPending}
            >
                {isPending ? 'Signing In...' : 'Log In'}
            </button>
        </form>
    );
};