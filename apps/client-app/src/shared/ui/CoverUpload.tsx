'use client';

import React, { useRef, useState } from 'react';

interface CoverUploadProps {
    value?: File | null;
    previewUrl?: string | null;
    onChange: (file: File | null) => void;
    error?: string;
    disabled?: boolean;
}

export const CoverUpload = ({ value, previewUrl, onChange, error, disabled }: CoverUploadProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(previewUrl ?? null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (file) {
            onChange(file);
            const url = URL.createObjectURL(file);
            setPreview(url);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        setPreview(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className="">
            <div className="cover-upload">
                <div
                    className={`cover-upload__zone${error ? ' cover-upload__zone--error' : ''}${disabled ? ' cover-upload__zone--disabled' : ''}`}
                    onClick={() => { if (!disabled) inputRef.current?.click(); }}
                >
                    {preview ? (
                        <>
                            <img src={preview} alt="Обкладинка" className="cover-upload__preview" />
                            <div className="cover-upload__overlay">
                                <button
                                    type="button"
                                    className="cover-upload__edit-btn"
                                    onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                                    disabled={disabled}
                                    aria-label="Змінити фото"
                                >
                                    <i className="bi bi-pencil" />
                                </button>
                                <button
                                    type="button"
                                    className="cover-upload__remove-btn"
                                    onClick={handleRemove}
                                    disabled={disabled}
                                    aria-label="Видалити фото"
                                >
                                    <i className="bi bi-trash" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="cover-upload__placeholder">
                            <i className="bi bi-pencil cover-upload__placeholder-icon" />
                            <span className="cover-upload__placeholder-text">Вибрати фото</span>
                        </div>
                    )}
                </div>


                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg, image/jpg, image/png, image/webp"
                    className="d-none"
                    disabled={disabled}
                    onChange={handleFileChange}
                />

            </div>
            {error && (
                <p className="cover-upload__error">{error}</p>
            )}
        </div>
    );
};