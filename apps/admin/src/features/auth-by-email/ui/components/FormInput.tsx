import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
    error?: string | null;
    label?: string;
    containerClassName?: string;
};
export const FormInput = React.memo(({ label, error, containerClassName = '', ...props }: Props) => (
    <div className={containerClassName}>
        {label && <label className="form-label admin-login__form-label mb-2">{label}</label>}
        <input {...props} className={`form-control admin-login__input ${error ? 'is-invalid' : ''} ${props.className ?? ''}`} />
        {error && <div className="invalid-feedback">{error}</div>}
    </div>
));