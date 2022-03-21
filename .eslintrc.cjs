// .cjs extension: with .js eslint expects does not support import syntax
module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module',
  },
  plugins: ['node'],
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'prettier/prettier': 'warn',
    // quick fixes to allow mu modules
    'node/no-extraneous-import': 'off',
    'node/no-missing-import': 'off',
  },
};
