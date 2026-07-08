/**
 * ESLint configuration (legacy .eslintrc format).
 *
 * ESLint 9 uses `eslint.config.js` as the active config. This file mirrors the
 * same rules for IDE tooling and documentation. Keep both files in sync.
 *
 * Ignore patterns are defined in `eslint.config.js` (ESLint 9 flat config).
 * See `.eslintignore` for the equivalent list.
 */
module.exports = {
  root: true,

  env: {
    node: true,
    es2022: true,
  },

  ignorePatterns: [
    'dist',
    'node_modules',
    'logs',
    'coverage',
    '*.log',
    'eslint.config.js',
  ],

  parser: '@typescript-eslint/parser',

  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    ecmaVersion: 'latest',
  },

  plugins: ['@typescript-eslint', 'simple-import-sort', 'n'],

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:n/recommended',
    'prettier',
  ],

  rules: {
    // ── Unused variables ────────────────────────────────────────────────────
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],

    // ── Import ordering ─────────────────────────────────────────────────────
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/order': 'off',

    // ── TypeScript ──────────────────────────────────────────────────────────
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': [
      'error',
      { checksVoidReturn: { attributes: false } },
    ],
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/no-unnecessary-condition': 'warn',

    // ── Node.js ─────────────────────────────────────────────────────────────
    'n/no-missing-import': 'off',
    'n/no-unpublished-import': 'off',
    'n/no-process-exit': 'warn',
    'n/prefer-global/process': ['error', 'always'],
    'n/prefer-node-protocol': 'error',

    // ── General code quality ────────────────────────────────────────────────
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'curly': ['error', 'all'],
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'warn',
  },

  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
    },
  ],
};
