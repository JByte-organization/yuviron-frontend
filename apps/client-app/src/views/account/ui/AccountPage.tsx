import { ChangePasswordForm } from '@/features/auth/change-password';

export const AccountPage = () => {
    return (
        <section className="client-account-page">
            <div className="client-account-page__card">
                <ChangePasswordForm />
            </div>
        </section>
    );
};

export default AccountPage;
