import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		cssMinify: 'lightningcss',
		rollupOptions: {
			output: {
				manualChunks: {
					'sanity-vendor': ['@sanity/image-url', '@portabletext/svelte'],
				}
			}
		}
	},
	server: {
		fs: {
			strict: false
		}
	}
});
