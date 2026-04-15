import { ResetPasswordForm } from '@/features/auth/restore-password';

export const ResetPasswordPage = () => {
    return (
        <section className="client-reset-page">
            <div className="client-reset-page__card">
                <ResetPasswordForm />
            </div>
        </section>
    );
};

export default ResetPasswordPage;