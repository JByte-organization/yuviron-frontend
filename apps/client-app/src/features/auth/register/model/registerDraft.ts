const KEY = 'register-draft';

export interface RegisterDraft {
    email?: string;
    password?: string;
    firstName?: string;
    day?: string;
    month?: string;
    year?: string;
    country?: string;
    city?: string;
    role?: 'listener' | 'author';
}

export const getRegisterDraft = (): RegisterDraft => {
    if (typeof window === 'undefined') return {};
    try {
        return JSON.parse(sessionStorage.getItem(KEY) ?? '{}') as RegisterDraft;
    } catch {
        return {};
    }
};

export const setRegisterDraft = (patch: Partial<RegisterDraft>) => {
    if (typeof window === 'undefined') return;
    const current = getRegisterDraft();
    sessionStorage.setItem(KEY, JSON.stringify({ ...current, ...patch }));
};

export const clearRegisterDraft = () => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(KEY);
};
