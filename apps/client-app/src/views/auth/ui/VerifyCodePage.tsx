import { Suspense } from 'react';
import { LoginWithCodeForm } from '@/features/auth/login-with-code';

export const VerifyCodePage = () => {
    return (
        <section className="client-forgot-page">
            <div className="client-forgot-page__panel">
                <div className="client-forgot-page__content">
                    <Suspense fallback={null}>
                        <LoginWithCodeForm />
                    </Suspense>
                </div>
            </div>
        </section>
    );
};

export default VerifyCodePage;
