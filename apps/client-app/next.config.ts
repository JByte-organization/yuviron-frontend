import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@repo/api"],
  // Прокси на бэк реализован как Route Handler:
  // src/app/api-proxy/[...path]/route.ts
  // (встроенный Next 16 rewrite-прокси не уважает NODE_TLS_REJECT_UNAUTHORIZED
  // и падает на внутреннем CA dev-сертификата). TLS-флаг ставится в dev-скрипте
  // через cross-env — см. package.json.
};

export default nextConfig;
