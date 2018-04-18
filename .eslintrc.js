module.exports = {
  extends: 'airbnb-base',
  rules: {
    'func-names': 0,
    'no-underscore-dangle': 0,
    'no-shadow': 0,
    'no-unused-vars': 1,
    'no-empty': 1,
  },
  plugins: ['jest'],
  env: {
    'jest/globals': true,
  },
};
