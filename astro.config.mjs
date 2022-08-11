import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify/functions';

export default defineConfig({
	vite: {
		ssr: {
			external: ["svgo"],
		},
	},
	adapter: netlify(),
	output: "server"
});
