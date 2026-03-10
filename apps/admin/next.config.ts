const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/ui"],
    sassOptions: {
        includePaths: [
            // Это позволит писать @import "mixins/banner" и Sass его найдет
            path.join(__dirname, '../../node_modules/bootstrap/scss'),
            path.join(__dirname, '../../node_modules'),
        ],
        // Это отключит те ворнинги, которые мы видели
        quietDeps: true,
    },
};

module.exports = nextConfig;