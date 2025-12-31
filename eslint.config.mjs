import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...compat.extends('prettier'),
  {
    ignores: [
      '.next/**',
      'out/**',
      'dist/**',
      'build/**',
      'node_modules/**',
      '.git/**',
      'src/generated/**',
      'prisma/generated/**',
      '**/*.d.ts',
      'pnpm-lock.yaml',
      '.pnpm-store/**',
      '.spectory/**',
      // Exclude test files from pre-commit linting
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      'src/__tests__/**',
      'e2e/**',
      'jest.setup.ts',
      'jest.config.mjs',
      'playwright.config.ts',
      'scripts/**/*',
      'prisma/scripts/**',
      'reference/**/*',
      'chrome-user-data-dir/**',
    ],
  },
  {
    rules: {
      // Disable rules that conflict with Prettier
      '@typescript-eslint/indent': 'off',
      '@typescript-eslint/quotes': 'off',
      '@typescript-eslint/semi': 'off',
      // Custom rules for better code quality
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-require-imports': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
]

export default eslintConfig
