# Linter + Pre-commit Hooks Design

**Date:** 2026-06-21
**Status:** Approved

## Scope

Set up ESLint (shared root config), Prettier, and Husky + lint-staged pre-commit hooks across the foolio monorepo.

## 1. ESLint

- Root `.eslintrc.js` using legacy config format (ESLint v8)
- Two `overrides` blocks:
  - `apps/api/**/*.ts` — `@typescript-eslint` + `@nestjs/eslint-plugin`, parserOptions → `apps/api/tsconfig.json`
  - `apps/web/**/*.{ts,tsx}` — `@typescript-eslint` + `eslint-plugin-react` + `eslint-plugin-react-hooks`, parserOptions → `apps/web/tsconfig.json`
- Existing `lint` scripts in both apps require no changes

## 2. Prettier

- Single `.prettierrc` at monorepo root
- Config: `semi: true`, `singleQuote: true`, `trailingComma: "all"`
- Applied to all staged files via lint-staged

## 3. Pre-commit hooks

- **Husky** installed at root; `prepare` script runs `husky install`
- **lint-staged** config in root `package.json`:
  - `*.{ts,tsx}` → `eslint --fix`, then `prettier --write`
  - `*.{js,json,md}` → `prettier --write`
- Pre-commit hook: `npx lint-staged`

## Out of Scope

- Helmet / HTTP security headers (explicitly excluded)
- Type-checking on commit
- CI linting pipeline
