import { ResetPasswordForm } from '@/features/auth/restore-password';

export const ResetPasswordPage = () => {
    return (
        <section className="client-reset-page">
            <div className="client-reset-page__panel">
                <div className="client-reset-page__content">
                    <div className="client-reset-page__logo">
                        <img
                            src="/Logo.svg"
                            alt="Yuviron"
                            className="client-reset-page__logo-image"
                        />
                    </div>

                    <ResetPasswordForm />
                </div>
            </div>
        </section>
    );
};

export default ResetPasswordPage;