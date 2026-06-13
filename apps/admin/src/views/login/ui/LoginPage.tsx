'use client';

import React from 'react';
import { LoginForm } from '@/features/auth-by-email/ui/LoginForm';
import Image from "next/image";

export const LoginPage = () => {
    return (
        <div className="admin-login vh-100 d-flex flex-column">
            <div className="admin-login__panel flex-grow-1 d-flex align-items-center justify-content-center">
                <div className="admin-login__content w-100 px-3 px-md-4">
                    <div className="text-center mb-5">
                        <Image
                            src="/images/logo/logo.svg"
                            alt="logo"
                            width={180}
                            height={180}
                            className="admin-login__logo"
                        />
                    </div>

                    <LoginForm />
                </div>
            </div>
        </div>
    );
};