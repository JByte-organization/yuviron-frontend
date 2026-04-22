'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface SelectOption {
    id: string;
    label: string;
}

interface Props {
    label: string;
    placeholder?: string;
    selected: SelectOption[];
    onChange: (items: SelectOption[]) => void;
    onSearch: (term: string) => Promise<SelectOption[]>;
}

export const AsyncSelect = ({ label, placeholder, selected, onChange, onSearch }: Props) => {
    const [term, setTerm] = useState('');
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!term.trim()) { setOptions([]); return; }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            setIsLoading(true);
            try {
                const results = await onSearch(term);
                setOptions(results);
                setIsOpen(true);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [term]);

    const handleAdd = (opt: SelectOption) => {
        if (!selected.find(s => s.id === opt.id)) {
            onChange([...selected, opt]);
        }
        setTerm('');
        setOptions([]);
        setIsOpen(false);
    };

    const handleRemove = (id: string) => {
        onChange(selected.filter(s => s.id !== id));
    };

    return (
        <div className="mb-4">
            <label className="form-label admin-text small fw-bold">{label}</label>

            {/* Selected tags */}
            {selected.length > 0 && (
                <div className="d-flex flex-wrap gap-1 mb-2">
                    {selected.map(s => (
                        <span key={s.id} className="badge bg-primary d-flex align-items-center gap-1">
                            {s.label}
                            <button
                                type="button"
                                className="btn-close btn-close-white ms-1"
                                style={{ fontSize: '0.5rem' }}
                                onClick={() => handleRemove(s.id)}
                            />
                        </span>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="position-relative">
                <input
                    type="text"
                    className="form-control admin-login__input"
                    placeholder={placeholder ?? `Search ${label.toLowerCase()}...`}
                    value={term}
                    onChange={e => setTerm(e.target.value)}
                    onFocus={() => options.length > 0 && setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 150)}
                    autoComplete="off"
                />
                {isLoading && (
                    <div className="position-absolute end-0 top-50 translate-middle-y pe-3">
                        <div className="spinner-border spinner-border-sm text-secondary" />
                    </div>
                )}

                {/* Dropdown */}
                {isOpen && options.length > 0 && (
                    <ul
                        className="list-unstyled mb-0 position-absolute w-100 rounded border border-secondary shadow"
                        style={{ top: '100%', zIndex: 1100, backgroundColor: '#2a2f3d', maxHeight: '200px', overflowY: 'auto' }}
                    >
                        {options.map(opt => (
                            <li
                                key={opt.id}
                                className="px-3 py-2 text-white small"
                                style={{ cursor: 'pointer' }}
                                onMouseDown={() => handleAdd(opt)}
                            >
                                {opt.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};