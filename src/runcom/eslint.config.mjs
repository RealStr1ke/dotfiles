import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { createConfigForNuxt } from '@nuxt/eslint-config/flat';
import pluginVue from 'eslint-plugin-vue';

const tseslintConfig = [
	...tseslint.configs.recommended,
	...tseslint.configs.stylistic,
];
const eslintConfig = eslint.configs.recommended;
const nuxtConfig = await createConfigForNuxt({});
const vueConfig = pluginVue.configs['flat/recommended'];

const customConfig = {
	ignores: [
		'**/.nuxt/*',
		'**/ignore/*',
		'**/node_modules/*',
		'.nuxt/',
	],
	rules: {
		'arrow-spacing': ['warn', {
			before: true,
			after: true,
		}],

		'brace-style': ['error', '1tbs', {
			allowSingleLine: true,
		}],

		'comma-dangle': ['error', 'always-multiline'],
		'comma-spacing': 'error',
		'comma-style': 'error',
		'curly': ['error', 'multi-line', 'consistent'],
		'dot-location': ['error', 'property'],
		'handle-callback-err': 'off',
		'indent': ['error', 'tab', {
			'SwitchCase': 1,
		}],
		'vue/html-indent': ['warn', 'tab'],
		'vue/script-indent': ['warn', 'tab'],
		'vue/html-comment-indent': ['warn', 'tab'],
		'keyword-spacing': 'error',

		'max-nested-callbacks': ['error', {
			max: 4,
		}],

		'max-statements-per-line': ['error', {
			max: 2,
		}],

		'no-console': 'off',

		'no-empty-function': ['error', {
			allow: ['arrowFunctions'],
		}],

		'no-floating-decimal': 'error',
		'no-lonely-if': 'error',
		'no-mixed-spaces-and-tabs': 'error',
		'no-multi-spaces': 'error',

		'no-multiple-empty-lines': ['error', {
			max: 2,
			maxEOF: 1,
			maxBOF: 0,
		}],

		'no-shadow': ['error', {
			allow: ['err', 'resolve', 'reject'],
		}],

		'no-trailing-spaces': ['error'],

		'no-unused-vars': ['off', {
			varsIgnorePattern: 'path',
		}],

		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-inferrable-types': 'off',

		'no-useless-escape': 'off',
		'no-undef': 'off',
		'no-var': 'error',
		'object-curly-spacing': ['error', 'always'],
		'prefer-const': 'error',
		'quotes': ['error', 'single'],
		'semi': ['error', 'always'],
		'space-before-blocks': 'error',

		'space-before-function-paren': ['error', {
			anonymous: 'never',
			named: 'never',
			asyncArrow: 'always',
		}],

		'space-in-parens': 'error',
		'space-infix-ops': 'error',
		'space-unary-ops': 'error',
		'spaced-comment': 'error',
		'yoda': 'error',
	},
	// languageOptions: {
	// 	parserOptions: {
	// 	  	projectService: true,
	// 	  	tsconfigRootDir: import.meta.dirname,
	// 	},
	// },
};

const fullConfig = [
	eslintConfig,
	...tseslintConfig,
	...nuxtConfig,
	...vueConfig,
	customConfig,
];

export default fullConfig;

console.log(fullConfig);