import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import simpleImport from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

export default defineConfig([
  ...tsEslint.configs.recommended,
  {
    plugins: {
      'simple-import-sort': simpleImport,
    },
    rules: {
      semi: 'error',
      quotes: ['error', 'double'],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
    files: ['**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },
  prettier,
]);
