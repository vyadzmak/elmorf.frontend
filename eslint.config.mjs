import pluginQuery from "@tanstack/eslint-plugin-query";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  {
    files: ["**/*.{js,jsx,mjs,ts,tsx}"],
    settings: {
      next: {
        rootDir: ["apps/site/", "apps/app/"],
      },
    },
  },
  ...nextVitals,
  ...nextTs,
  ...pluginQuery.configs["flat/recommended"],
  globalIgnores([
    "**/.next/**",
    "**/out/**",
    "**/build/**",
    "**/next-env.d.ts",
    "**/storybook-static/**",
    "**/.turbo/**",
    "**/coverage/**",
    "**/node_modules/**",
    "**/mockServiceWorker.js",
  ]),
]);

export default eslintConfig;
