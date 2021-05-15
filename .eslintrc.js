module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    commonjs: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2015,
    sourceType: 'module',
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  rules: {
    semi: [2, 'never'],
    quotes: [2, 'single'],
    'object-curly-spacing': [2, 'always'],
    'array-bracket-spacing': [2, 'never'],
    '@typescript-eslint/no-var-requires': 0,
    'comma-spacing': [2, { before: false, after: true }],
    // 'comma-dangle': [
    //   2,
    //   {
    //     arrays: 'always-multiline',
    //     exports: 'always-multiline',
    //     functions: 'never',
    //     imports: 'always-multiline',
    //     objects: 'always-multiline',
    //   },
    // ],
    'no-unused-vars': [
      1,
      {
        args: 'after-used',
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
  },
}
