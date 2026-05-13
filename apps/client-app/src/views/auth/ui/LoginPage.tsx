import { LoginForm } from '@/features/auth/login';

export const LoginPage = () => {
    return (
        <section className="client-login-page">
            <div className="client-login-page__card">
                <div className="client-login-page__logo">
                    <img
                        src="/logo.svg"
                        alt="LumiTune"
                        className="client-login-page__logo-image"
                    />
                </div>

                <h1 className="client-login-page__title">Пориньте у LumiTune</h1>

                <LoginForm />
            </div>
        </section>
    );
};

export default LoginPage;