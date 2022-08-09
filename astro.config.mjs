import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
	vite: {
		ssr: {
			external: ["svgo"],
		},
	},
	adapter: vercel(),
	output: "server"
});