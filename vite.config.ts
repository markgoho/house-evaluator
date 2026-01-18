import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		// Use port 5173 for development (Vite default)
		port: 5173,
		strictPort: false
	}
});
