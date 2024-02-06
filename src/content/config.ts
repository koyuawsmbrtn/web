import { z, defineCollection } from "astro:content";
const postsCollection = defineCollection({
    type: 'content',
    schema: z.object({
      title: z.string(),
      pubDate: z.date(),
      tags: z.array(z.string()).optional(),
      image: z.string().optional(),
      featured_image: z.string().optional(),
      description: z.string().optional(),
      draft: z.boolean().optional()
    })
});
export const collections = {
  posts: postsCollection,
};