import { defineConfig } from 'orval';

const mutatorConfig = {
    path: './packages/api/src/mutator.ts',
    name: 'customInstance',
};

const queryConfig = {
    useQuery: true,
    useInfinite: true,
};

export default defineConfig({
    // ─── Адмінка ──────────────────────────────────────────
    yuviron_admin: {
        input: 'https://dev-api.yuviron.com/swagger/admin/swagger.json',
        output: {
            mode: 'tags',
            target: './packages/api/src/generated/admin/endpoints',
            schemas: './packages/api/src/generated/admin/models',
            prettier: true,
            client: 'react-query',
            override: {
                query: queryConfig,
                mutator: mutatorConfig,
            },
        },
    },

    // ─── Клієнт ───────────────────────────────────────────
    yuviron_client: {
        input: 'https://dev-api.yuviron.com/swagger/client/swagger.json',
        output: {
            mode: 'tags',
            target: './packages/api/src/generated/client/endpoints',
            schemas: './packages/api/src/generated/client/models',
            prettier: true,
            client: 'react-query',
            override: {
                query: queryConfig,
                mutator: mutatorConfig,
            },
        },
    },
});