import { type SanityDocument } from "next-sanity";
import { PortableText } from "@/components/portable-text";
import { client } from "@/sanity/client";
import Image from "next/image";
import { urlForImage } from "@/sanity/image";

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]`;

const options = { next: { revalidate: 30 } };

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = await client.fetch<SanityDocument>(POST_QUERY, await params, options);
  
  if (!post) {
    return (
      <>
        <h1 className="text-4xl font-bold mb-8">Error 404</h1>
        <div className="flex items-start space-x-6">
          <div className="flex flex-col space-y-2">
            <p>Page not found</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {post.image && (
        <Image
          src={urlForImage(post.image)?.url() || "/placeholder.png"}
          alt={post.title}
          className="aspect-video rounded-xl w-full my-8"
          width={640}
          height={640}
        />
      )}
      <h1 className="text-4xl font-bold">{post.title}</h1>
      <p className="uppercase font-bold text-muted-foreground mb-8">
        Published: {new Date(post.publishedAt).toLocaleDateString()}
      </p>
      {Array.isArray(post.body) && <PortableText value={post.body} />}
    </>
  );
}
