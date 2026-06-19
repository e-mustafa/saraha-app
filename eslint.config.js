import js from '@eslint/js';
import globals from 'globals';

export default [
	// Apply recommended settings from ESLint
	js.configs.recommended,

	{
		// Define the environment (Node.js) and file type
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module', // Or "commonjs" if you are using require instead of import
			globals: {
				...globals.node, // Recognizes Node.js global variables like process and __dirname without issues
			},
		},

		// Customize rules according to your preference
		rules: {
			'no-undef': 'error', // Prevents using undefined variables (which would otherwise crash the server)
			'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Warns about variables that are defined but never used
			'no-console': 'off', // Allows using console.log (essential for backend monitoring/logging)
			'prefer-const': 'error', // Enforces using const if the variable's value is never reassigned
			'no-unreachable': 'error', // Detects dead code that will never be executed (e.g., code after a return statement)
		},
	},
];
