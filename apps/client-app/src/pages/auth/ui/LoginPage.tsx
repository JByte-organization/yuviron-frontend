import { LoginForm } from '@/features/auth/login';

export const LoginPage = () => {
    return (
        <section className="client-login-page">

            <div className="client-login-page__panel">
                <div className="client-login-page__content">
                    <div className="client-login-page__logo">
                        <img
                            src="/Logo.svg"
                            alt="Yuviron"
                            className="client-login-page__logo-image"
                        />
                    </div>

                    <LoginForm />
                </div>
            </div>
        </section>
    );
};

export default LoginPage;