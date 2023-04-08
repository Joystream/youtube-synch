module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
  },
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 14,
    'sourceType': 'module',
    project: './tsconfig.json',
  },
  'plugins': ['@typescript-eslint'],
  'rules': {
    'lines-between-class-members': ['error', 'always', { 'exceptAfterSingleLine': true }],
    '@typescript-eslint/no-floating-promises': ['error'],
  },
}
