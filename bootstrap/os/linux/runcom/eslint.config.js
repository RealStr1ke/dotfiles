const js = require("@eslint/js");

module.exports = [
	js.configs.recommended,
	{
		ignores: ["**/ignore/", "**/node_modules/"],
		rules: {
			"arrow-spacing": ["warn", {
				before: true,
				after: true,
			}],

			"brace-style": ["error", "1tbs", {
				allowSingleLine: true,
			}],

			"comma-dangle": ["error", "always-multiline"],
			"comma-spacing": "error",
			"comma-style": "error",
			curly: ["error", "multi-line", "consistent"],
			"dot-location": ["error", "property"],
			"handle-callback-err": "off",
			indent: ["error", "tab"],
			"keyword-spacing": "error",

			"max-nested-callbacks": ["error", {
				max: 4,
			}],

			"max-statements-per-line": ["error", {
				max: 2,
			}],

			"no-console": "off",

			"no-empty-function": ["error", {
				allow: ["arrowFunctions"],
			}],

			"no-floating-decimal": "error",
			"no-lonely-if": "error",
			"no-mixed-spaces-and-tabs": "error",
			"no-multi-spaces": "error",

			"no-multiple-empty-lines": ["error", {
				max: 2,
				maxEOF: 1,
				maxBOF: 0,
			}],

			"no-shadow": ["error", {
				allow: ["err", "resolve", "reject"],
			}],

			"no-trailing-spaces": ["error"],

			"no-unused-vars": ["warn", {
				varsIgnorePattern: "path",
			}],

			"no-useless-escape": "off",
			"no-undef": "off",
			"no-var": "error",
			"object-curly-spacing": ["error", "always"],
			"prefer-const": "error",
			quotes: ["error", "single"],
			semi: ["error", "always"],
			"space-before-blocks": "error",

			"space-before-function-paren": ["error", {
				anonymous: "never",
				named: "never",
				asyncArrow: "always",
			}],

			"space-in-parens": "error",
			"space-infix-ops": "error",
			"space-unary-ops": "error",
			"spaced-comment": "error",
			yoda: "error",
		},
	}
];