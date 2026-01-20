import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'node:path';

export default defineConfig({
	plugins: [
		svelte({
			hot: !process.env['VITEST'],
			compilerOptions: {
				runes: true
			}
		})
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./vitest-setup.ts']
	},
	resolve: {
		alias: {
			$lib: resolve('./src/lib'),
			$app: resolve('./node_modules/@sveltejs/kit/src/runtime/app')
		},
		conditions: ['browser']
	}
});
