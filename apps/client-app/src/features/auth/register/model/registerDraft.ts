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

// Полностью ли заполнен черновик для финального register. true бывает только
// после прохода всех шагов — например когда юзер вернулся на email-шаг после
// 409 «почта занята»: пароль и анкета уже в черновике, и сменив только почту,
// он по «Далі» уходит сразу на register, минуя шаги пароля/профиля.
export const isRegisterDraftComplete = (draft: RegisterDraft): boolean =>
    Boolean(
        draft.email &&
            draft.password &&
            draft.firstName &&
            draft.day &&
            draft.month &&
            draft.year &&
            draft.country &&
            draft.city,
    );
