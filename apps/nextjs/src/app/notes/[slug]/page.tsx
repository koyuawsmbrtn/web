import { type SanityDocument } from "next-sanity";
import { PortableText } from "@/components/portable-text";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import Image from "next/image";

const NOTE_QUERY = `*[_type == "note" && slug.current == $slug][0]`;

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const options = { next: { revalidate: 30 } };

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const note = await client.fetch<SanityDocument>(NOTE_QUERY, await params, options);
  const noteImageUrl = note.image
    ? urlFor(note.image)?.width(550).height(310).url()
    : null;

  if (!note) {
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
      {noteImageUrl ? <Image
        src={noteImageUrl}
        alt={note.title}
        className="aspect-video rounded-xl"
        width={550}
        height={310}
      /> : ""}
      <h1 className="text-4xl font-bold mb-8">{note.title}</h1>
      {Array.isArray(note.body) && <PortableText value={note.body} />}
    </>
  );
}
