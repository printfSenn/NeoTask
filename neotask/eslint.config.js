import globals from 'globals'
export default [{
  files: ['src/**/*.js','src/**/*.jsx'],
  languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: { ...globals.browser }, parserOptions: { ecmaFeatures: { jsx: true } } },
  rules: { 'no-undef': 'error', 'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none', varsIgnorePattern: '^React$' }] }
}]
