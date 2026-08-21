import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

const canonicalPackageFiles = [
  'packages/contracts/**/*.ts',
  'packages/deterministic-math/**/*.ts',
  'packages/simulation-core/**/*.ts',
  'packages/replay/**/*.ts',
];

export default tseslint.config(
  {
    ignores: ['coverage/**', 'dist/**', 'node_modules/**', 'packages/contracts/src/generated/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['packages/contracts/test/*.ts'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: canonicalPackageFiles,
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'document', message: 'Canonical packages cannot use the DOM.' },
        { name: 'window', message: 'Canonical packages cannot use browser globals.' },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['three', 'three/*'],
              message: 'Canonical packages cannot depend on Three.js.',
            },
          ],
        },
      ],
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'Use the frozen deterministic PRNG.' },
        { object: 'Date', property: 'now', message: 'Canonical state cannot use wall-clock time.' },
      ],
    },
  },
);
