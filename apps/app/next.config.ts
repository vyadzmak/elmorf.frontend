import type { NextConfig } from "next";
import path from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(process.cwd(), "../.."),
  transpilePackages: [
    "@elmorf/ui",
    "@elmorf/i18n",
    "@elmorf/config",
    "@elmorf/domain",
    "@elmorf/api-client",
    "@elmorf/mocks",
    "@elmorf/graph",
  ],
};

export default withNextIntl(nextConfig);
