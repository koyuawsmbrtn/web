import { PortableText, type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";

const PAGE_QUERY = `*[_type == "page" && slug.current == $slug][0]`;

const options = { next: { revalidate: 30 } };

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const page = await client.fetch<SanityDocument>(PAGE_QUERY, await params, options);

  return (
    <>
      <h1 className="text-4xl font-bold mb-8">{page.title}</h1>
      <PortableText value={page.body} />
    </>
  );
}
