// eslint.config.mjs — Flat config for ESLint 9
// Root-only; all packages inherit via turbo pipeline

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
  // Global ignores
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.next/**',
      '.turbo/**',
      'coverage/**',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
      'turbo.json',
      'pnpm-lock.yaml',
      'pnpm-workspace.yaml',
    ],
  },

  // Base JS/TS config
  js.configs.recommended,

  // TypeScript strict config
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,

  // Import plugin for unused imports detection
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,

  // Resolve TS path aliases (e.g. @/ in apps/web) for import/no-unresolved;
  // the resolver uses each file's nearest tsconfig.json by default
  {
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true },
      },
    },
  },

  // Project-specific rules
  {
    rules: {
      // Enforce strict type checking (non-type-aware rules only)
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unused-expressions': 'error',
      // Type-aware rules disabled - require parserOptions.project for type info
      // '@typescript-eslint/no-floating-promises': 'error',
      // '@typescript-eslint/no-misused-promises': 'error',
      // '@typescript-eslint/require-await': 'error',
      // '@typescript-eslint/no-unnecessary-condition': 'error',
      // '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      // '@typescript-eslint/prefer-nullish-coalescing': 'error',
      // '@typescript-eslint/prefer-optional-chain': 'error',
      // '@typescript-eslint/consistent-type-imports': 'error',
      // '@typescript-eslint/consistent-type-exports': 'error',

      // Import rules
      'import/no-unused-modules': 'off',
      'import/no-duplicates': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          pathGroups: [
            {
              pattern: '@gq/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-duplicate-imports': 'error',
      'no-unreachable': 'error',
      'no-unused-labels': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Override for test files — allow certain patterns
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/test/**/*.ts', '**/tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'no-console': 'off',
    },
  },

  // Override for config files
  {
    files: ['*.config.ts', '*.config.js', '*.config.mjs'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Override for generated/Prisma files
  {
    files: ['**/prisma/**/*.ts', '**/generated/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  }
);