module.exports = {
  root: true,
  parser: 'babel-eslint',
  env: {
    browser: true,
    node: true,
    'jest/globals': true,
  },
  extends: 'standard',
  rules: {},
  globals: {},
  plugins: ['jest'],
}
