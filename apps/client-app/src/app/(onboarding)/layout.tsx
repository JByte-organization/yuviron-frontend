'use client';

import type { ReactNode } from 'react';

// Онбординг (стати артистом) — той самий чистий центрований шелл, що й auth-сторінки
// (логін/реєстрація): без хедера, сайдбара й футера. Окрема група, бо ці екрани,
// на відміну від (auth), для вже залогінених користувачів.
export default function OnboardingLayout({ children }: { children: ReactNode }) {
    return <main className="client-auth-shell">{children}</main>;
}
