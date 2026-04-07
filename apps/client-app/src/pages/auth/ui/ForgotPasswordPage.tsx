'use client';

export const ForgotPasswordPage = () => {
    return (
        <div className="container d-flex align-items-center justify-content-center vh-100">
            <div className="card bg-dark border-secondary p-4 shadow-lg" style={{ width: '400px' }}>
                <h3 className="text-white fw-bold mb-3 text-center">Forgot Password</h3>
                <p className="text-secondary text-center small">Enter email to receive code</p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;