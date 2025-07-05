module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    webextensions: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    // Code quality
    'no-unused-vars': 'warn',
    'no-console': 'off', // Allow console for debugging
    'no-debugger': 'warn',
    'no-alert': 'warn',
    
    // Best practices
    'eqeqeq': 'error',
    'curly': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    
    // Variables
    'no-undef': 'error',
    'no-unused-expressions': 'warn',
    
    // Stylistic
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    
    // ES6+
    'prefer-const': 'error',
    'no-var': 'error',
    'arrow-spacing': 'error',
    'template-curly-spacing': 'error',
    
    // Browser specific
    'no-restricted-globals': [
      'error',
      {
        name: 'event',
        message: 'Use the parameter instead.'
      }
    ]
  },
  globals: {
    // Chrome extension APIs
    chrome: 'readonly',
    
    // Browser APIs
    AudioContext: 'readonly',
    webkitAudioContext: 'readonly',
    
    // Test environment
    describe: 'readonly',
    it: 'readonly',
    expect: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly'
  }
}; 