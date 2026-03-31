import { defineConfig } from 'orval';

export default defineConfig({
    yuviron: {
        input: 'https://dev-api.yuviron.com/swagger/v1/swagger.json',
        output: {
            mode: 'tags',
            target: './packages/api/src/generated/endpoints',
            schemas: './packages/api/src/generated/models',
            prettier: true,
            client: 'react-query',
            // Добавь эти опции для чистоты типов
            override: {
                query: {
                    useQuery: true,
                    useInfinite: true, // Полезно для списков [cite: 1390]
                },
                mutator: {
                    path: './packages/api/src/mutator.ts',
                    name: 'customInstance',
                },
            },
        },
    },
});