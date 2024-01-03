import { defineConfig } from 'astro/config';
import mdx from "@astrojs/mdx";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: 'https://web.koyu.space',
  integrations: [
    mdx(),
    icon({
      include: {
        "simple-icons": ["*"],
        "fa-solid": ["envelope"]
      }
    })
  ],
  prefetch: {
    prefetchAll: true
  }
});