import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET() {
  const posts = await getCollection("posts", ({ data }) => {
    return data.draft !== true;
  });
  return rss({
    title: "koyu's personal website | Blog",
    description: "My personal blog",
    site: "https://web.koyu.space",
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description ? post.data.description : "",
      link: `/posts/${post.slug}/`,
    })),
    customData: `<language>en-gb</language>`,
  });
}
