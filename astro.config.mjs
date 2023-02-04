import { defineConfig } from 'astro/config';
import turbolinks from'@astrojs/turbolinks';

export default defineConfig({
  integrations: [turbolinks()],
  site: 'https://web.koyu.space',
});
