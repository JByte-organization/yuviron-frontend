'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const Step2Profile = () => {
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.push('/login');
    };

    return (
        <div className="client-register-profile-form">
            <div className="client-register-profile-form__top">
                <Link href="/register/details" className="client-register-profile-form__back text-decoration-none">
                    Назад
                </Link>
            </div>

            <div className="client-register-profile-form__logo">
                <img src="/Logo.svg" alt="LumiTune" className="client-register-profile-form__logo-image" />
            </div>

            <h1 className="client-register-profile-form__title">Створіть профіль</h1>
            <div className="client-register-profile-form__step">Крок 2 із 2</div>

            <div className="client-register-profile-form__progress">
                <span className="client-register-profile-form__progress-fill" />
            </div>

            <form onSubmit={handleSubmit}>
                {/* оставляешь свои текущие поля как есть */}

                <button type="submit" className="btn client-register-profile-form__submit w-100">
                    Зареєструватися
                </button>
            </form>
        </div>
    );
};

export default Step2Profile;