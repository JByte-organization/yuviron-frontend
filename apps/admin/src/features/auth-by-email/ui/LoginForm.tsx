'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePostApiAuthLogin } from '@repo/api';

export const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const { mutate, isPending } = usePostApiAuthLogin({
        mutation: {
            onSuccess: (response: any) => {
                const data = response?.data || response;
                const token = data?.token;
                const permissions = data?.permissions;

                console.log('Token received:', token);

                if (token) {
                    // токен для Mutator
                    localStorage.setItem('auth_token', token);

                    // права
                    localStorage.setItem('user_permissions', JSON.stringify(permissions));

                    router.push('/users');
                } else {
                    alert('Ошибка: Токен не найден в ответе сервера.');
                }
            },
            onError: (error) => {
                console.error('Ошибка мутации!', error);
            }
        }
    });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Кнопка нажата! Данные формы:', { email, password });

        mutate({
            data: {
                email: email,
                password: password
            }
        });
    };

    return (
        <form onSubmit={handleLogin}>
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

            {/* Заменили <a> на <button type="submit"> для работы формы */}
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