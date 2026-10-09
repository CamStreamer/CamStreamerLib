import baseConfig from '@camstreamer/eslint-config';
import globals from 'globals';
import { fileURLToPath } from 'node:url';

export default [
    ...baseConfig,
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: 'tsconfig.json',
                tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url)),
            },
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
        rules: {
            'no-console': 'off',
        },
    },
];
