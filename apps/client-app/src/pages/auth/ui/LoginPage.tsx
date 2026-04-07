import { LoginForm } from '@/features/auth/login';

export const LoginPage = () => {
    return (
        <section className="client-auth-page client-auth-page--login">
            <div className="client-auth-page__panel">
                <div className="client-auth-page__content">
                    <div className="client-auth-logo">
                        <img
                            src="/Logo.svg"
                            alt="Yuviron"
                            className="client-auth-logo__image"
                        />
                    </div>

                    <LoginForm />
                </div>
            </div>
        </section>
    );
};

export default LoginPage;