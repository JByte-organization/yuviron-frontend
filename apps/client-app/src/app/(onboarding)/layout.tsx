'use client';

import type { ReactNode } from 'react';

export default function OnboardingLayout({ children }: { children: ReactNode }) {
    return <main className="client-auth-shell">{children}</main>;
}
