import { Suspense } from 'react';
import { ConfirmEmailForm } from '@/features/auth/confirm-email';

export const VerifyCodePage = () => {
    return (
        <section className="client-forgot-page">
            <div className="client-forgot-page__panel">
                <div className="client-forgot-page__content">
                    <Suspense fallback={null}>
                        <ConfirmEmailForm />
                    </Suspense>
                </div>
            </div>
        </section>
    );
};

export default VerifyCodePage;
