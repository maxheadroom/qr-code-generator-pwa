module.exports = {
  env: {
    browser: true,
    es2021: true,
    worker: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'script',
  },
  globals: {
    QRCode: 'readonly',
    QRUtils: 'readonly',
    QRValidation: 'readonly',
    saveAs: 'readonly',
    jsQR: 'readonly',
    JSZip: 'readonly',
    jspdf: 'readonly',
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'warn',
    'no-undef': 'error',
  },
};
