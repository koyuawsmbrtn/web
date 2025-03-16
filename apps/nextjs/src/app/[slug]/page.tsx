import { type SanityDocument } from "next-sanity";
import { PortableText } from "@/components/portable-text"
import { client } from "@/sanity/client";
import { urlForImage } from "@/sanity/image";
import Image from "next/image";

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
      <div className="flex items-start space-x-6">
        <div className="flex flex-col space-y-2">
          <PortableText value={page.body} />
        </div>
        {page.image ? <Image src={urlForImage(page.image).url()} alt={page.title} className="rounded-xl object-cover" width={250} height={250} /> : ""}
      </div>
    </>
  );
}
