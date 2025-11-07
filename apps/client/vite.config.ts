import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		cssMinify: 'lightningcss'
	},
	server: {
		fs: {
			strict: false
		}
	}
});
