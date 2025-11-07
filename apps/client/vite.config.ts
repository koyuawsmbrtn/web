import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		cssMinify: 'lightningcss',
		rollupOptions: {
			output: {
				manualChunks(id) {
					// Group Sanity-related client-side modules
					if (id.includes('@portabletext/svelte') || id.includes('@sanity/image-url')) {
						return 'sanity-vendor';
					}
					// Group other large vendor libraries
					if (id.includes('node_modules')) {
						return 'vendor';
					}
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
