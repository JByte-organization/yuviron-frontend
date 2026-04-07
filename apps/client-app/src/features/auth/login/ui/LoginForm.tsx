'use client';

import Link from 'next/link';
import { useState } from 'react';

export const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form className="client-auth-form">
            <div className="mb-4">
                <label htmlFor="email" className="form-label client-auth-form__label">
                    Email Address
                </label>
                <input
                    id="email"
                    type="email"
                    className="form-control client-auth-form__input"
                    placeholder="admin@gmail.com"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="password" className="form-label client-auth-form__label">
                    Password
                </label>

                <div className="client-auth-form__password-wrap">
                    <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        className="form-control client-auth-form__input client-auth-form__input--password"
                        placeholder="********************"
                    />

                    <button
                        type="button"
                        className="client-auth-form__toggle"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? 'Hide' : 'Show'}
                    </button>
                </div>
            </div>

            <button type="submit" className="btn client-auth-form__submit w-100">
                Log In
            </button>

            <div className="mt-4">
                <Link href="/forgot-password" className="client-auth-form__link text-decoration-none">
                    Lost your password?
                </Link>
            </div>
        </form>
    );
};

export default LoginForm;