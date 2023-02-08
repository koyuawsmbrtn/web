import rss, { pagesGlobToRssItems } from '@astrojs/rss';

export async function get() {
  return rss({
    title: "koyu's personal website | Blog",
    description: 'My personal blog',
    site: 'https://web.koyu.space',
    items: await pagesGlobToRssItems(import.meta.glob('./posts/*.md')),
    customData: `<language>en-gb</language>`,
  });
}