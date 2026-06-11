import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
    build: {
        lib: {
            // ТОЛЬКО ОДИН ВХОД. Это критично для обхода бага Vite 8
            entry: path.resolve(__dirname, 'index.ts'),
            name: 'UiKit',
            formats: ['es'],
            fileName: 'index',
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'bootstrap'],
        },
        // Это заставит Vite выплюнуть один style.css
        cssCodeSplit: false,
    },
    plugins: [dts({ insertTypesEntry: true })],
});