import { VerifyCodeForm } from '@/features/auth/restore-password';

export const VerifyCodePage = () => {
    return (
        <section className="client-forgot-page">
            <div className="client-forgot-page__panel">
                <div className="client-forgot-page__content">
                    <VerifyCodeForm />
                </div>
            </div>
        </section>
    );
};

export default VerifyCodePage;
