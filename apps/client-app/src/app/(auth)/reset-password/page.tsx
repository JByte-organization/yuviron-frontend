import { Suspense } from 'react';
import { ResetPasswordPage } from '@/views/auth/ui/ResetPasswordPage';

export default function ResetPassword() {
    return (
        <Suspense>
            <ResetPasswordPage />
        </Suspense>
    );
}