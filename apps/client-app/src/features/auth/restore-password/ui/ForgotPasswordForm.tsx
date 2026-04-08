'use client';

export const ForgotPasswordForm = () => {
    return (
        <form className="client-forgot-form">
            <div className="mb-4">
                <label htmlFor="email" className="form-label client-forgot-form__label">
                    Email Address
                </label>
                <input
                    id="email"
                    type="email"
                    className="form-control client-forgot-form__input"
                    placeholder="admin@gmail.com"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="code" className="form-label client-forgot-form__label">
                    Code
                </label>

                <div className="client-forgot-form__code-wrap">
                    <input
                        id="code"
                        type="text"
                        className="form-control client-forgot-form__input client-forgot-form__input--code"
                        placeholder="********************"
                    />

                    <button
                        type="button"
                        className="client-forgot-form__send-code"
                    >
                        Send Code
                    </button>
                </div>
            </div>

            <button type="submit" className="btn client-forgot-form__submit w-100">
                Continue
            </button>
        </form>
    );
};

export default ForgotPasswordForm;