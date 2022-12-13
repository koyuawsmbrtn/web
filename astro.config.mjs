import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify/functions';
// import turbolinks from'@astrojs/turbolinks';

export default defineConfig({
  // integrations: [turbolinks()],
  output: 'server',
  adapter: netlify()
});
