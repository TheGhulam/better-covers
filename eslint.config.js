// Flat ESLint config (ESLint 9+).
// See https://eslint.org/docs/latest/use/configure/configuration-files for details.

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    ignores: ["dist", "node_modules", "coverage", "**/*.snap"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        document: "readonly",
        window: "readonly",
        HTMLCanvasElement: "readonly",
        CanvasRenderingContext2D: "readonly",
        OffscreenCanvas: "readonly",
        ImageData: "readonly",
        Uint8Array: "readonly",
        Int32Array: "readonly",
        Uint32Array: "readonly",
        Float32Array: "readonly",
        Math: "readonly",
        Set: "readonly",
        Map: "readonly",
      },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // React
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // TypeScript
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],

      // Style — keep light, Prettier handles formatting
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "smart"],
    },
  },
  {
    // Determinism guardrails — applied only to renderer and shared code.
    // These are the project's hard contract: no clocks, no Math.random,
    // no network. Other code (Cover.tsx, Gallery, tests, examples) is
    // allowed to do what it likes.
    files: ["src/renderers/**/*.{ts,tsx}", "src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-globals": [
        "error",
        {
          name: "Date",
          message:
            "Renderers must be deterministic. Don't read the clock — derive everything from SEED.",
        },
        {
          name: "fetch",
          message: "Renderers don't make network calls.",
        },
      ],
      "no-restricted-properties": [
        "error",
        {
          object: "Math",
          property: "random",
          message:
            "Renderers must be deterministic. Use mulberry32(SEED) or hash2(x, y, SEED) from ../shared instead.",
        },
        {
          object: "performance",
          property: "now",
          message: "Renderers must be deterministic. Don't read the clock.",
        },
        {
          object: "Date",
          property: "now",
          message: "Renderers must be deterministic. Don't read the clock.",
        },
      ],
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "tests/**/*.{ts,tsx}"],
    languageOptions: {
      globals: {
        document: "readonly",
        window: "readonly",
        HTMLCanvasElement: "readonly",
        CanvasRenderingContext2D: "readonly",
        Uint8ClampedArray: "readonly",
      },
    },
  },
];
