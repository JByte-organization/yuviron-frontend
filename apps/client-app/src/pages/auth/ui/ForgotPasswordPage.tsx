import { ForgotPasswordForm } from '@/features/auth/restore-password';

export const ForgotPasswordPage = () => {
    return (
        <section className="client-forgot-page">
            <div className="client-forgot-page__card">
                <ForgotPasswordForm />
            </div>
        </section>
    );
};

export default ForgotPasswordPage;