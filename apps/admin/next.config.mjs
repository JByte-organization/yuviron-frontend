import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/UsersPage.tsx", "@repo/api"],
    experimental: {
        turbo: {
            resolveAlias: {
                // Это магия: любой импорт, начинающийся с bootstrap/,
                // Turbopack будет искать по этому абсолютному пути
                "bootstrap/": path.join(__dirname, "../../node_modules/bootstrap/"),
            },
        },
    },
    sassOptions: {
        // Оставляем для обычного Sass лоадера
        includePaths: [path.join(__dirname, "../../node_modules")],
        quietDeps: true,
    },
};

export default nextConfig;