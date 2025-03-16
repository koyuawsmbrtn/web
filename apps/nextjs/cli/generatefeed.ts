import { createClient } from '@sanity/client'
import RSS from 'rss'
import fs from 'fs'
import {toHTML} from '@portabletext/to-html'

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
    useCdn: false,
})

async function generateRssFeed() {
    const settingsQuery = `*[_type == "settings"][0] {
        websiteName,
        websiteDescription,
        websiteUrl
    }`
    const settings = await client.fetch(settingsQuery)
    const feed = new RSS({
        title: settings.websiteName,
        description: settings.websiteDescription,
        feed_url: `${settings.websiteUrl}/feed.rss`,
        site_url: settings.websiteUrl,
        language: 'en',
    })

    const query = `*[_type == "post"] | order(publishedAt desc) {
        title,
        slug,
        publishedAt,
        excerpt,
        body
    }`

    const posts = await client.fetch(query)

    posts.forEach((post: any) => {
        feed.item({
            title: post.title,
            description: toHTML(post.body),
            url: `${settings.websiteUrl}/posts/${post.slug.current}`,
            date: new Date(post.publishedAt),
        })
    })

    const rss = feed.xml({ indent: true })
    fs.writeFileSync('public/feed.rss', rss)
    console.log('RSS feed generated successfully!')
}

generateRssFeed().catch(console.error)