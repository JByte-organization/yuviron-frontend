import { RegisterForm } from '@/features/auth/register';

export const RegisterPage = () => {
    return (
        <section className="client-register-page">
            <div className="client-register-page__card">
                <div className="client-register-page__logo">
                    <img
                        src="/logo.svg"
                        alt="Yuviron"
                        className="client-register-page__logo-image"
                    />
                </div>

                <h1 className="client-register-page__title">
                    Пориньте вперше
                    <br />
                    у Yuviron
                </h1>

                <RegisterForm />
            </div>
        </section>
    );
};

export default RegisterPage;