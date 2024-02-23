import { defineConfig } from 'astro/config';
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import remarkExternalLinks from 'remark-external-links';

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
  markdown: {
    remarkPlugins: [[remarkExternalLinks, { target: '_blank' }]],
  },
});
