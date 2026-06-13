// Довідники країн/міст для реєстрації. Спільні для UI (Step2Profile) та
// складання register-payload (useRegisterSubmit), щоб не дублювати й не розходитись.

export const COUNTRIES: ReadonlyArray<{ code: string; label: string }> = [
    { code: 'UA', label: 'Україна' },
    { code: 'PL', label: 'Польща' },
    { code: 'DE', label: 'Німеччина' },
];

// Міста залежать від обраної країни (інакше для Польщі показувались українські міста).
export const CITIES_BY_COUNTRY: Record<string, string[]> = {
    UA: ['Київ', 'Львів', 'Одеса', 'Харків', 'Дніпро'],
    PL: ['Варшава', 'Краків', 'Вроцлав', 'Гданськ', 'Познань'],
    DE: ['Берлін', 'Мюнхен', 'Гамбург', 'Кельн', 'Франкфурт'],
};

export const citiesFor = (country: string): string[] =>
    country ? CITIES_BY_COUNTRY[country] ?? [] : [];

// Код країни → людська назва. Бек зберігає RegisterCommand.country як вільний
// рядок, тож шлемо назву ('Польща'), щоб у профілі не світився код 'PL'.
// Невідомий код повертаємо як є.
export const countryLabel = (code: string | undefined): string | undefined => {
    if (!code) return code;
    return COUNTRIES.find((c) => c.code === code)?.label ?? code;
};
