// .cjs extension: with .js eslint expects does not support import syntax
module.exports = {
  root: true,
  plugins: ['node'],
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'prettier/prettier': 'error',
    'node/no-missing-import': 'off', // quick fix to allow mu modules
  },
};
