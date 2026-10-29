import prettier from 'eslint-config-prettier';
import path from 'node:path';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

// SvelteKit 3 renamed these; AI-generated code tends to reach for the Kit 2 names.
const kit2Paths = [
	{ name: '$app/environment', message: 'SvelteKit 3: use $app/env.' },
	{ name: '$app/stores', message: 'SvelteKit 3: use $app/state.' }
];
const kit2Patterns = [{ group: ['$lib', '$lib/*'], message: 'SvelteKit 3: use #lib.' }];
// Bindings are read in exactly one place so the DB access point can change later.
const bindingsPath = {
	name: 'cloudflare:workers',
	message: 'Only src/lib/server/platform.ts may import cloudflare:workers.'
};

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	{
		ignores: ['src/lib/components/ui/**', 'worker-configuration.d.ts', 'docs/**', '.superpowers/**']
	},
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser
			}
		}
	},
	{
		// Override or add rule settings here, such as:
		// 'svelte/button-has-type': 'error'
		rules: {
			'no-restricted-imports': [
				'error',
				{ paths: [...kit2Paths, bindingsPath], patterns: kit2Patterns }
			],
			'no-restricted-syntax': [
				'error',
				{
					// D1 has no interactive transactions; libsql in tests would silently accept one.
					selector: "CallExpression[callee.property.name='transaction']",
					message: 'D1: use db.batch.'
				}
			]
		}
	},
	{
		files: ['src/lib/server/platform.ts'],
		rules: {
			'no-restricted-imports': ['error', { paths: kit2Paths, patterns: kit2Patterns }]
		}
	}
);
