'use client';

import { useState } from 'react';

export const RegisterForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);

    return (
        <form className="client-register-form">
            <div className="mb-4">
                <label htmlFor="email" className="form-label client-register-form__label">
                    Email Address
                </label>
                <input
                    id="email"
                    type="email"
                    className="form-control client-register-form__input"
                    placeholder="admin@gmail.com"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="password" className="form-label client-register-form__label">
                    Password
                </label>

                <div className="client-register-form__password-wrap">
                    <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        className="form-control client-register-form__input client-register-form__input--password"
                        placeholder="********************"
                    />

                    <button
                        type="button"
                        className="client-register-form__toggle"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? 'Hide' : 'Show'}
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <label htmlFor="repeatPassword" className="form-label client-register-form__label">
                    Repeat Password
                </label>

                <div className="client-register-form__password-wrap">
                    <input
                        id="repeatPassword"
                        type={showRepeatPassword ? 'text' : 'password'}
                        className="form-control client-register-form__input client-register-form__input--password"
                        placeholder="********************"
                    />

                    <button
                        type="button"
                        className="client-register-form__toggle"
                        onClick={() => setShowRepeatPassword((prev) => !prev)}
                        aria-label={showRepeatPassword ? 'Hide password' : 'Show password'}
                    >
                        {showRepeatPassword ? 'Hide' : 'Show'}
                    </button>
                </div>
            </div>

            <button type="submit" className="btn client-register-form__submit w-100">
                Sign In
            </button>
        </form>
    );
};

export default RegisterForm;