/* eslint-disable  @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import { components } from "@/components/portable-text";
import { urlForImage } from "@/sanity/image";

const POSTS_PER_PAGE = 6;

const QUERY = `{
  "posts": *[_type == "post" && defined(slug.current)]|order(publishedAt desc),
  "intro": *[_type == "blockdocument" && tag == "blog-intro"][0]{
    html,
    content
  },
  "total": count(*[_type == "post" && defined(slug.current)])
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
  total: number;
}

export default async function IndexPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const { posts, intro, total } = await client.fetch<BlogData>(QUERY, {}, options);
  
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);
  const offset = (page - 1) * POSTS_PER_PAGE;
  const currentPosts = posts.slice(offset, offset + POSTS_PER_PAGE);

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
        {currentPosts.map((post) => (
          <div key={post._id} className="flex flex-col h-full">
            <Link href={`/blog/${post.slug.current}`} className="no-underline group">
              <div className="aspect-video relative overflow-hidden rounded-xl">
                <Image 
                  src={urlForImage(post.image)?.url() || "/placeholder.png"} 
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
        {currentPosts.length === 0 && (
          <p className="text-muted-foreground col-span-2">No posts found :&#40;</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Link
            href={`/blog?page=${Math.max(1, page - 1)}`}
            className={`px-3 py-2 rounded no-underline ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
          >
            ←
          </Link>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Link
              key={pageNum}
              href={`/blog?page=${pageNum}`}
              className={`px-3 py-2 rounded no-underline ${
                pageNum === page ? 'bg-accent text-black' : ''
              }`}
            >
              {pageNum}
            </Link>
          ))}
          <Link
            href={`/blog?page=${Math.min(totalPages, page + 1)}`}
            className={`px-3 py-2 rounded no-underline ${
              page >= totalPages ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            →
          </Link>
        </div>
      )}
    </main>
  );
}
