module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier', 'import', 'eslint-plugin-tsdoc', 'jest'],
  extends: [
    'airbnb-base',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  ignorePatterns: ['build/**/*.*', 'dist/**/*.*', 'docs/^(?!examples)/*.*', '*.typegen.ts'],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.js', '.ts'],
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
        paths: ['src'],
      },
    },
    typescript: {},
  },

  rules: {
    'tsdoc/syntax': 'error',
    'no-shadow': 0,
    '@typescript-eslint/no-shadow': ['error'],
    indent: 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    'import/prefer-default-export': 0,
    'jest/no-hooks': [
      'error',
      {
        allow: ['afterAll', 'afterEach', 'beforeAll', 'beforeEach'],
      },
    ],
    'jest/lowercase-name': 0,
    'jest/require-hook': 0,
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        ts: 'never',
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['*.config*.*', '**/*test.*'],
      },
    ],
    'no-console': [
      'error',
      {
        allow: ['warn', 'error'],
      },
    ],
    'func-style': [
      'warn',
      'declaration',
      {
        allowArrowFunctions: true,
      },
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message:
          'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message:
          '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
    'max-len': [
      'error',
      {
        code: 100,
        tabWidth: 2,
        ignoreComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'accessor-pairs': [
      'error',
      {
        setWithoutGet: true,
        getWithoutSet: false,
        enforceForClassMembers: true,
      },
    ],
    'no-dupe-keys': 'error',
    'no-dupe-class-members': 'error',
    'newline-after-var': 'error',
    'newline-before-return': 'error',
    'lines-around-directive': 'error',
    'no-useless-call': 'error',
    'operator-linebreak': 'off',
  },

  overrides: [
    {
      files: ['**/__mocks__/**'],
      rules: {
        'jsdoc/require-jsdoc': 'off',
      },
    },
  ],
};
