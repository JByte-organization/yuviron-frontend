import React, { useState } from 'react';
import { CredentialsStep } from './CredentialsStep';
import { OtpStep } from './OtpStep';
import { useInitCsrf } from './hooks/useInitCsrf';

export const LoginForm: React.FC = () => {
    useInitCsrf();
    const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
    const [email, setEmail] = useState('');

    return (
        <>
            {step === 'credentials' && <CredentialsStep onSuccess={(e) => { setEmail(e); setStep('otp'); }} />}
            {step === 'otp' && <OtpStep email={email} onBack={() => setStep('credentials')} />}
        </>
    );
};