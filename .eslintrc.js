module.exports = {
  root: true,
  extends: [
    '@react-native',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off', // TypeScript strict mode provides sufficient type safety

    // React rules
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/no-unstable-nested-components': ['warn', { allowAsProps: true }],

    // General rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'warn',
    'no-var': 'error',
    // Disable inline styles rule - common pattern in React Native
    'react-native/no-inline-styles': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    'node_modules/',
    'android/',
    'coverage/',
    '*.config.js',
    'babel.config.js',
    'metro.config.js',
  ],
  overrides: [
    {
      // Allow require() in test files (common pattern for Jest dynamic imports)
      files: ['**/__tests__/**/*', '**/*.test.ts', '**/*.test.tsx', '**/*.test.js'],
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-function-type': 'off',
      },
    },
    {
      // Allow bitwise operators in models (used for UUID generation)
      files: ['src/models/**/*.ts'],
      rules: {
        'no-bitwise': 'off',
      },
    },
    {
      // Allow any in type definitions (common for external library types)
      files: ['**/*.d.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      // Setup files may need deep imports for mocking
      files: ['**/__tests__/setup.js'],
      rules: {
        '@react-native/no-deep-imports': 'off',
      },
    },
  ],
};
