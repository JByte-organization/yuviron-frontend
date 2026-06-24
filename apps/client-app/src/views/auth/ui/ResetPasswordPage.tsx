import { Suspense } from 'react';
import { ResetPasswordForm } from '@/features/auth/restore-password';

export const ResetPasswordPage = () => {
    return (
        <section className="client-reset-page">
            <div className="client-reset-page__card">
                <Suspense fallback={null}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </section>
    );
};

export default ResetPasswordPage;