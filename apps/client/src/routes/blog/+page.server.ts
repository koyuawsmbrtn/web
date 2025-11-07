import type { PageServerLoad } from './$types';
import { serverClient } from '$lib/server/sanity';
import type { Blog } from '$lib/sanity.types';

const BLOGS_PER_PAGE = 12;

const BLOGS_QUERY = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc, _createdAt desc)[$start...$end]{
	_id,
	_type,
	_createdAt,
	_updatedAt,
	title,
	slug,
	author,
	publishedAt,
	tags,
	excerpt,
	image,
	body[0...2]
}`;

const TOTAL_BLOGS_QUERY = `count(*[_type == "post" && defined(slug.current)])`;

const BLOG_INTRO_QUERY = `*[_type == "blockdocument" && tag == "blog-intro"][0]{
	html,
	content
}`;

export const load: PageServerLoad = async ({ url, depends }) => {
	depends('blog:pagination', url.searchParams.toString());
	try {
		const page = parseInt(url.searchParams.get('page') || '1', 10);
		const start = (page - 1) * BLOGS_PER_PAGE;
		const end = start + BLOGS_PER_PAGE;

		const [blogs, totalBlogs, blogIntro]: [Blog[], number, any] = await Promise.all([
			serverClient.fetch(BLOGS_QUERY, { start, end }),
			serverClient.fetch(TOTAL_BLOGS_QUERY),
			serverClient.fetch(BLOG_INTRO_QUERY)
		]);

		const totalPages = Math.ceil(totalBlogs / BLOGS_PER_PAGE);

		// Process blogs to extract descriptions if excerpt doesn't exist
		const processedBlogs = blogs.map((blog) => {
			let description = blog.excerpt;

			if (!description && blog.body && Array.isArray(blog.body)) {
				const firstBlock = blog.body[0];
				if (
					firstBlock &&
					firstBlock._type === 'block' &&
					'children' in firstBlock &&
					Array.isArray(firstBlock.children)
				) {
					description = firstBlock.children
						.filter((child: any) => child.text)
						.map((child: any) => child.text)
						.join(' ')
						.slice(0, 160);
				}
			}

			return {
				...blog,
				description
			};
		});

		return {
			blogs: processedBlogs,
			intro: blogIntro,
			pagination: {
				currentPage: page,
				totalPages,
				totalBlogs,
				hasNextPage: page < totalPages,
				hasPreviousPage: page > 1
			},
			meta: {
				title: 'Blog',
				description: blogIntro?.content || 'Read our latest blog posts and articles.'
			}
		};
	} catch (error) {
		console.error('Error fetching blogs:', error);
		return {
			blogs: [],
			intro: null,
			pagination: {
				currentPage: 1,
				totalPages: 0,
				totalBlogs: 0,
				hasNextPage: false,
				hasPreviousPage: false
			},
			meta: {
				title: 'Blog',
				description: 'Read our latest blog posts and articles.'
			}
		};
	}
};
