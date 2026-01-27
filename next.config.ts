import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    async rewrites() {
        return [
            { source: "/users/getList", destination: "/api/users/getList" },
            { source: "/users/:id", destination: "/api/users/:id" },
            { source: "/users", destination: "/api/users" },
            { source: "/orders/:id", destination: "/api/orders/:id" },
            { source: "/orders", destination: "/api/orders" }
        ];
    }
};

export default nextConfig;