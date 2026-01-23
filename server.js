/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname);

process.env.NODE_ENV = "production";
process.chdir(dir);

const currentPort = parseInt(process.env.PORT, 10) || 3000;
const hostname = process.env.HOSTNAME || "0.0.0.0";

let keepAliveTimeout = parseInt(process.env.KEEP_ALIVE_TIMEOUT, 10);

const requiredServerFilesPath = path.join(
  dir,
  ".next",
  "required-server-files.json",
);

let nextConfig;
try {
  const requiredServerFiles = JSON.parse(
    fs.readFileSync(requiredServerFilesPath, "utf8"),
  );
  nextConfig = requiredServerFiles.config ?? {};
} catch (error) {
  console.error(
    `Failed to read Next.js build config at ${requiredServerFilesPath}`,
    error,
  );
  process.exit(1);
}

process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(nextConfig);

require("next");
const { startServer } = require("next/dist/server/lib/start-server");

if (
  Number.isNaN(keepAliveTimeout) ||
  !Number.isFinite(keepAliveTimeout) ||
  keepAliveTimeout < 0
) {
  keepAliveTimeout = undefined;
}

startServer({
  dir,
  isDev: false,
  config: nextConfig,
  hostname,
  port: currentPort,
  allowRetry: false,
  keepAliveTimeout,
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
