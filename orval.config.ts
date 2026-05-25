import { defineConfig } from 'orval';
import { existsSync } from 'node:fs';

// Пайплайн деплоя ходит за свежими Swagger-файлами на хост и кладёт их в
// packages/api/openapi/*.swagger.json ДО docker build. Контейнер потом
// `COPY packages ./packages` и эти файлы попадают внутрь. Внутри контейнера
// dev-api.yuviron.com недоступен (он за Tailscale), поэтому Orval должен
// читать локальные файлы, а не fetch'ить по URL.
//
// Локально файлов нет — фоллбэк на URL, чтобы `pnpm api:gen` продолжал
// работать у разработчиков с поднятой Tailscale.
const LOCAL_ADMIN_SWAGGER = './packages/api/openapi/admin.swagger.json';
const LOCAL_CLIENT_SWAGGER = './packages/api/openapi/client.swagger.json';
const REMOTE_ADMIN_SWAGGER = 'https://dev-api.yuviron.com/swagger/admin/swagger.json';
const REMOTE_CLIENT_SWAGGER = 'https://dev-api.yuviron.com/swagger/client/swagger.json';

const adminInput = existsSync(LOCAL_ADMIN_SWAGGER) ? LOCAL_ADMIN_SWAGGER : REMOTE_ADMIN_SWAGGER;
const clientInput = existsSync(LOCAL_CLIENT_SWAGGER) ? LOCAL_CLIENT_SWAGGER : REMOTE_CLIENT_SWAGGER;

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
        input: adminInput,
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
        input: clientInput,
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