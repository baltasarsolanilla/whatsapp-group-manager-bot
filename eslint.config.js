import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	// Apply recommended rules
	js.configs.recommended,
	...tseslint.configs.recommended,

	// Disable ESLint rules that conflict with Prettier
	prettier,

	{
		files: ['**/*.{js,mjs,cjs,ts}'],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				project: './tsconfig.json',
			},
		},
		rules: {
			// TypeScript rules
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_' },
			],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/prefer-nullish-coalescing': 'error',
			'@typescript-eslint/prefer-optional-chain': 'error',
			'@typescript-eslint/no-explicit-any': 'error',

			// Code quality rules (non-formatting)
			'no-console': 'warn',
			'no-debugger': 'error',
			'prefer-const': 'error',
			'no-var': 'error',
			'object-shorthand': 'error',
			'no-duplicate-imports': 'error',
			eqeqeq: ['error', 'always'],
			curly: 'error',

			// Let Prettier handle all formatting rules
			// Don't add rules like 'indent', 'quotes', 'semi', etc.
		},
	},

	{
		ignores: [
			'node_modules/**',
			'dist/**',
			'build/**',
			'coverage/**',
			'*.config.js',
			'.env*',
			'docs/**/*.js',
		],
	}
);
