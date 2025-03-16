import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import { components } from "@/components/portable-text";
import { urlForImage } from "@/sanity/image";

const QUERY = `{
  "posts": *[_type == "post" && defined(slug.current)]|order(publishedAt desc)[0...12]{
    _id, 
    title, 
    slug, 
    publishedAt,
    image
  },
  "intro": *[_type == "blockdocument" && tag == "blog-intro"][0]{
    html,
    content
  }
}`;

const options = { next: { revalidate: 30 } };

interface BlogData {
  posts: SanityDocument[];
  intro?: {
    html?: {
      code: string;
    };
    content?: any[];
  };
}

export default async function IndexPage() {
  const { posts, intro } = await client.fetch<BlogData>(QUERY, {}, options);

  return (
    <main className="container mx-auto min-h-screen max-w-5xl p-8">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      
      {intro && (
        <div className="prose dark:prose-invert mb-12">
          {intro.content ? (
            <PortableText value={intro.content} components={components} />
          ) : intro.html?.code ? (
            <div dangerouslySetInnerHTML={{ __html: intro.html.code }} />
          ) : null}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 gap-y-10">
        {posts.map((post) => (
          <div key={post._id} className="flex flex-col h-full">
            <Link href={`/blog/${post.slug.current}`} className="no-underline group">
              <div className="aspect-video relative overflow-hidden rounded-xl">
                <Image 
                  src={urlForImage(post.image)?.url()} 
                  alt={post.title} 
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h2 className="text-xl font-semibold text-foreground mt-4 group-hover:text-accent transition-colors">
                {post.title}
              </h2>
              <p className="text-muted-foreground">
                {new Date(post.publishedAt).toLocaleDateString()}
              </p>
            </Link>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="text-muted-foreground col-span-2">No posts found :&#40;</p>
        )}
      </div>
    </main>
  );
}
