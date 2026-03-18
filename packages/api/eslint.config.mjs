import baseConfig from "@repo/eslint-config/base";

/** @type {import('eslint').Linter.Config[]} */
export default [
    ...baseConfig,
    {
        // Здесь можно будет добавить специфичные правила только для API, если понадобятся
    },
];