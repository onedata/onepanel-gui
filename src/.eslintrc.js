/* eslint-env node */

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
  },
  plugins: [
    'ember',
  ],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
  ],
  env: {
    browser: true,
    es6: true,
    jquery: true,
  },
  rules: {
    'no-console': 0,
    'dot-location': [
      1,
      'property',
    ],
    'eol-last': 1,
    'comma-dangle': [
      1,
      'always-multiline',
    ],
    'quotes': [
      1,
      'single',
    ],
    'quote-props': [
      1,
      'consistent-as-needed',
    ],
    'no-warning-comments': [
      1,
      {
        terms: ['fixme'],
      },
    ],
    'semi': 2,
    'no-restricted-globals': [
      2,
      'name',
      'blur',
    ],
    'valid-jsdoc': [
      1,
      {
        requireParamDescription: false,
        requireReturnDescription: false,
        requireReturn: false,
      },
    ],
    // TODO: currently experimental for manual use
    'ember/order-in-components': [0, {
      order: [
        ['service', 'property'],
        'empty-method',
        'single-line-function',
        'multi-line-function',
        'observer',
        'init',
        'didReceiveAttrs',
        'willRender',
        'willInsertElement',
        'didInsertElement',
        'didRender',
        'didUpdateAttrs',
        'willUpdate',
        'didUpdate',
        'willDestroyElement',
        'willClearRender',
        'didDestroyElement',
        'method',
        'actions',
      ]
    }]
  },
};
