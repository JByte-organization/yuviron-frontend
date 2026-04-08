import { ForgotPasswordForm } from '@/features/auth/restore-password';

export const ForgotPasswordPage = () => {
    return (
        <section className="client-forgot-page">
            <div className="client-forgot-page__panel">
                <div className="client-forgot-page__content">
                    <div className="client-forgot-page__logo">
                        <img
                            src="/Logo.svg"
                            alt="Yuviron"
                            className="client-forgot-page__logo-image"
                        />
                    </div>

                    <ForgotPasswordForm />
                </div>
            </div>
        </section>
    );
};

export default ForgotPasswordPage;