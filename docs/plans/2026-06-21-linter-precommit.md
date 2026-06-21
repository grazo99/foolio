# Linter + Pre-commit Hooks Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a shared ESLint config, Prettier, and Husky + lint-staged pre-commit hooks to the foolio monorepo.

**Architecture:** Single root-level `.eslintrc.js` with `overrides` per app (NestJS API and React web). Husky hooks lint-staged on pre-commit, running ESLint --fix + Prettier --write on staged files only.

**Tech Stack:** ESLint v8, @typescript-eslint, @nestjs/eslint-plugin, eslint-plugin-react, eslint-plugin-react-hooks, Prettier, Husky, lint-staged.

---

### Task 1: Install ESLint dependencies at root

**Files:**
- Modify: `package.json` (root)

**Step 1: Install all ESLint-related packages as root devDependencies**

```bash
cd /path/to/foolio

pnpm add -Dw \
  eslint@^8 \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  @nestjs/eslint-plugin \
  eslint-plugin-react \
  eslint-plugin-react-hooks
```

**Step 2: Verify packages appear in root `package.json` devDependencies**

```bash
cat package.json | grep -A 10 '"devDependencies"'
```

Expected: all six packages listed.

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: install eslint deps at monorepo root"
```

---

### Task 2: Create root ESLint config

**Files:**
- Create: `.eslintrc.js` (root)

**Step 1: Create the file with this exact content**

```js
// .eslintrc.js
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  overrides: [
    {
      // NestJS API
      files: ['apps/api/**/*.ts'],
      plugins: ['@typescript-eslint', '@nestjs'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      parserOptions: {
        project: 'apps/api/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    {
      // React web
      files: ['apps/web/**/*.{ts,tsx}'],
      plugins: ['@typescript-eslint', 'react', 'react-hooks'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
      ],
      parserOptions: {
        project: 'apps/web/tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      settings: {
        react: { version: 'detect' },
      },
    },
  ],
};
```

**Step 2: Verify lint runs without crashing**

```bash
pnpm --filter @foolio/api lint
pnpm --filter @foolio/web lint
```

Expected: no "Cannot find module" or parser errors. There may be lint warnings/errors in the source — that's fine for now.

**Step 3: Commit**

```bash
git add .eslintrc.js
git commit -m "chore: add shared root ESLint config with per-app overrides"
```

---

### Task 3: Add Prettier

**Files:**
- Create: `.prettierrc` (root)
- Modify: `package.json` (root)

**Step 1: Install Prettier at root**

```bash
pnpm add -Dw prettier
```

**Step 2: Create `.prettierrc` at the monorepo root**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

**Step 3: Verify Prettier can format a file**

```bash
npx prettier --check apps/api/src/main.ts
```

Expected: either "All matched files use Prettier code style!" or a diff showing what would change (both are fine).

**Step 4: Commit**

```bash
git add .prettierrc package.json pnpm-lock.yaml
git commit -m "chore: add Prettier config"
```

---

### Task 4: Set up Husky + lint-staged

**Files:**
- Modify: `package.json` (root)

**Step 1: Install Husky and lint-staged at root**

```bash
pnpm add -Dw husky lint-staged
```

**Step 2: Add `prepare` script and `lint-staged` config to root `package.json`**

The scripts section should become:

```json
"scripts": {
  "dev": "pnpm --parallel --filter './apps/*' dev",
  "build": "pnpm --filter './packages/*' build && pnpm --filter './apps/*' build",
  "lint": "pnpm --recursive lint",
  "prepare": "husky install"
},
```

And add a top-level `lint-staged` key:

```json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{js,json,md}": ["prettier --write"]
}
```

**Step 3: Initialize Husky**

```bash
pnpm prepare
```

Expected: creates `.husky/` directory.

**Step 4: Create the pre-commit hook**

```bash
npx husky add .husky/pre-commit "npx lint-staged"
```

Expected: `.husky/pre-commit` file created containing `npx lint-staged`.

**Step 5: Verify the hook file looks right**

```bash
cat .husky/pre-commit
```

Expected output:
```
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

**Step 6: Test the hook end-to-end**

Stage a TypeScript file and commit to trigger the hook:

```bash
# Touch a file to stage it
touch apps/api/src/main.ts
git add apps/api/src/main.ts
git commit -m "test: verify pre-commit hook runs"
```

Expected: lint-staged output appears showing ESLint and Prettier running on the staged file. Commit should succeed.

**Step 7: Commit all hook setup files**

```bash
git add package.json pnpm-lock.yaml .husky/
git commit -m "chore: add Husky pre-commit hook with lint-staged"
```
