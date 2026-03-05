import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    output: 'standalone',
    
    transpilePackages: ["@yuviron/ui"],
    sassOptions: {
        // Указываем путь к корню, чтобы Sass всегда находил Bootstrap
        includePaths: [path.resolve(__dirname, '../../node_modules')],
        // Прячем весь этот мусор из консоли
        silenceDeprecations: [
            'import',
            'color-functions', // Скроет ошибки про red(), green(), blue()
            'global-builtin',
            'if-function'
        ],
    },
};

export default nextConfig;