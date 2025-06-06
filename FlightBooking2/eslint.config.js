const { defineConfig, globalIgnores } = require('eslint/config');

const globals = require('globals');
const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

module.exports = defineConfig([
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.jest
      },

      ecmaVersion: 12,
      sourceType: 'module',
      parserOptions: {}
    },

    extends: compat.extends('eslint:recommended'),

    rules: {
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],

      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_'
        }
      ],

      'no-undef': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-trailing-spaces': 'error',
      'comma-dangle': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],

      'max-len': [
        'error',
        {
          code: 200
        }
      ],

      'prefer-const': 'error',
      'no-var': 'error'
    }
  },
  globalIgnores([
    '**/node_modules/',
    '**/coverage/',
    '**/dist/',
    '**/build/',
    '**/package-lock.json',
    '**/*.min.js'
  ])
]);
