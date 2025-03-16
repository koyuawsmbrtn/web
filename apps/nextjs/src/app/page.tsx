import { type SanityDocument } from "next-sanity"
import { client } from "@/sanity/client"
import { PortableText } from "@/components/portable-text"

const PAGE_QUERY = `*[_type == "page" && slug.current == "index"][0]`

const options = { next: { revalidate: 30 } }

export default async function HomePage() {
    const page = await client.fetch<SanityDocument>(PAGE_QUERY, {}, options)
    return Array.isArray(page.body) && <PortableText value={page.body} />
}