import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        settings: {
            next: {
                rootDir: ['apps/admin/', 'apps/backoffice/', 'apps/client-app/'],
            },
        }
    },
    globalIgnores([
        '**/.next/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/coverage/**',
        '**/next-env.d.ts',
    ]),
])