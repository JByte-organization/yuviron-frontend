import { Suspense } from 'react';
import { CheckEmailNotice } from '@/features/auth/register';

export const RegisterCheckEmailPage = () => {
    return (
        <section className="client-forgot-page">
            <div className="client-forgot-page__panel">
                <div className="client-forgot-page__content">
                    <Suspense fallback={null}>
                        <CheckEmailNotice />
                    </Suspense>
                </div>
            </div>
        </section>
    );
};

export default RegisterCheckEmailPage;
