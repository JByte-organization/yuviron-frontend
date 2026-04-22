import { Step2Profile } from '@/features/auth/register';

export const RegisterProfilePage = () => {
    return (
        <section className="client-register-profile-page">
            <div className="client-register-profile-page__card">
                <Step2Profile />
            </div>
        </section>
    );
};

export default RegisterProfilePage;