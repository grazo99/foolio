module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  overrides: [
    {
      // NestJS API — @typescript-eslint only (no nestjs plugin exists)
      files: ['apps/api/**/*.ts'],
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
      rules: {
        // React 17+ uses the automatic JSX transform — no import needed
        'react/react-in-jsx-scope': 'off',
      },
    },
  ],
};
