
export const COUNTRIES: ReadonlyArray<{ code: string; label: string }> = [
    { code: 'UA', label: 'Україна' },
    { code: 'PL', label: 'Польща' },
    { code: 'DE', label: 'Німеччина' },
];

export const CITIES_BY_COUNTRY: Record<string, string[]> = {
    UA: ['Київ', 'Львів', 'Одеса', 'Харків', 'Дніпро'],
    PL: ['Варшава', 'Краків', 'Вроцлав', 'Гданськ', 'Познань'],
    DE: ['Берлін', 'Мюнхен', 'Гамбург', 'Кельн', 'Франкфурт'],
};

export const citiesFor = (country: string): string[] =>
    country ? CITIES_BY_COUNTRY[country] ?? [] : [];

export const countryLabel = (code: string | undefined): string | undefined => {
    if (!code) return code;
    return COUNTRIES.find((c) => c.code === code)?.label ?? code;
};
