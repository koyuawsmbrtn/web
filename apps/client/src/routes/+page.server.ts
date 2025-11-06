import { client } from '$lib/sanity'
import type { PageServerLoad } from './$types'

const PAGE_QUERY = `*[_type == "page" && slug.current == "index"][0]{
  _id,
  _type,
  title,
  body,
  slug
}`

export const load: PageServerLoad = async () => {
  try {
    const page = await client.fetch(PAGE_QUERY)
    
    return {
      page,
      meta: {
        title: page?.title || 'Home',
        description: 'Welcome to my portfolio'
      }
    }
  } catch (error) {
    console.error('Error loading homepage:', error)
    return {
      page: null,
      meta: {
        title: 'Home',
        description: 'Welcome to my portfolio'
      }
    }
  }
}