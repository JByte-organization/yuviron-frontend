import { VerifyCodeForm } from '@/features/auth/restore-password';

export const VerifyCodePage = () => {
    return (
        <section className="client-verify-page">
            <div className="client-verify-page__card">
                <VerifyCodeForm />
            </div>
        </section>
    );
};

export default VerifyCodePage;