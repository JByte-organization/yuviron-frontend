'use client';

export const ResetPasswordForm = () => {
    return (
        <form className="client-reset-form">
            <div className="mb-4">
                <label htmlFor="newPassword" className="form-label client-reset-form__label">
                    New Password
                </label>
                <input
                    id="newPassword"
                    type="password"
                    className="form-control client-reset-form__input"
                    placeholder="********************"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="repeatPassword" className="form-label client-reset-form__label">
                    Repeat Password
                </label>
                <input
                    id="repeatPassword"
                    type="password"
                    className="form-control client-reset-form__input"
                    placeholder="********************"
                />
            </div>

            <button type="submit" className="btn client-reset-form__submit w-100">
                Log In
            </button>
        </form>
    );
};

export default ResetPasswordForm;