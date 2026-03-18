'use client';

import { useState } from 'react';

export default function RepeatPasswordPage() {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);

    return (
        <div className="admin-login vh-100 d-flex flex-column">
            <div className="admin-login__panel flex-grow-1 d-flex align-items-center justify-content-center">
                <div className="admin-login__content w-100 px-3 px-md-4">
                    <div className="text-center mb-5">
                        <img
                            src="/Logo/logo.svg"
                            alt="Logo"
                            width={180}
                            height={180}
                            className="admin-login__logo"
                        />
                    </div>

                    <form>
                        <div className="mb-4">
                            <label
                                htmlFor="newPassword"
                                className="form-label admin-login__form-label mb-2"
                            >
                                New Password
                            </label>

                            <div className="position-relative">
                                <input
                                    id="newPassword"
                                    type={showNewPassword ? 'text' : 'password'}
                                    className="form-control admin-login__input pe-5"
                                    placeholder="********************"
                                />

                                <button
                                    type="button"
                                    className="btn admin-login__toggle position-absolute top-50 end-0 translate-middle-y"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        <div className="mb-5">
                            <label
                                htmlFor="repeatPassword"
                                className="form-label admin-login__form-label mb-2"
                            >
                                Repeat Password
                            </label>

                            <div className="position-relative">
                                <input
                                    id="repeatPassword"
                                    type={showRepeatPassword ? 'text' : 'password'}
                                    className="form-control admin-login__input pe-5"
                                    placeholder="********************"
                                />

                                <button
                                    type="button"
                                    className="btn admin-login__toggle position-absolute top-50 end-0 translate-middle-y"
                                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                                >
                                    {showRepeatPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        <a href="/login" className="btn btn-primary py-3 w-100">
                            Sign In
                        </a>
                    </form>
                </div>
            </div>
        </div>
    );
}