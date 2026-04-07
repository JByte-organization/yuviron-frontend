import { RegisterForm } from '@/features/auth/register';

export const RegisterPage = () => {
    return (
        <section className="client-register-page">

            <div className="client-register-page__panel">
                <div className="client-register-page__content">
                    <div className="client-register-page__logo">
                        <img
                            src="/Logo.svg"
                            alt="Yuviron"
                            className="client-register-page__logo-image"
                        />
                    </div>

                    <RegisterForm />
                </div>
            </div>
        </section>
    );
};

export default RegisterPage;