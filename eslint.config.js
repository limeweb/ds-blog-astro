import { defineConfig } from "eslint/config";
import eslintPluginAstro from "eslint-plugin-astro";
import globals from "globals";

export default defineConfig([
    ...eslintPluginAstro.configs["jsx-a11y-recommended"],
    {
        rules: {
            // 'astro/no-set-html-directive': 'error',
            "astro/semi": ["error", "always"],
            "astro/sort-attributes": [
                "warn",
                { type: "alphabetical", order: "asc", ignoreCase: true },
            ],
            "astro/prefer-class-list-directive": "warn",
            "astro/prefer-split-class-list": "warn",
            // 'astro/jsx-a11ty/alt-text': 'error',
            // 'astro/jsx-a11y/image-redundant-alt': 'warn',
            "astro/jsx-a11y/anchor-is-valid": "warn",
            "astro/jsx-a11y/anchor-ambiguous-text": "warn",
            "astro/jsx-a11y/aria-role": "error",
            "sort-imports": ["warn"],
        },
        languageOptions: {
            globals: globals.browser,
        },
    },
]);
