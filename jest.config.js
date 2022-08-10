/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/?(*.)+(test).[jt]s?(x)'],
    moduleDirectories: ['node_modules', 'src', 'test'],
    transform: {
        '^.+\\.ts?$': 'ts-jest',
    },
    transformIgnorePatterns: ['/node_modules/'],
};
