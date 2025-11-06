import { browser } from '$app/environment';
import { serverClient } from '$lib/server/sanity';
import type { Blog } from '$lib/sanity.types';

const BLOGS_PER_PAGE = 12;

const BLOGS_QUERY = `*[_type == "blog" && defined(slug.current)] | order(publishedAt desc, _createdAt desc)[$start...$end]{
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
	mainImage,
	body[0...2]
}`;

const TOTAL_BLOGS_QUERY = `count(*[_type == "blog" && defined(slug.current)])`;

export interface BlogPaginationData {
	blogs: Blog[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalBlogs: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}

export async function fetchBlogsClientSide(page: number = 1): Promise<BlogPaginationData> {
	if (!browser) {
		throw new Error('This function should only be called on the client side');
	}

	const start = (page - 1) * BLOGS_PER_PAGE;
	const end = start + BLOGS_PER_PAGE;

	try {
		const [blogs, totalBlogs]: [Blog[], number] = await Promise.all([
			serverClient.fetch(BLOGS_QUERY, { start, end }),
			serverClient.fetch(TOTAL_BLOGS_QUERY)
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
			pagination: {
				currentPage: page,
				totalPages,
				totalBlogs,
				hasNextPage: page < totalPages,
				hasPreviousPage: page > 1
			}
		};
	} catch (error) {
		console.error('Error fetching blogs client-side:', error);
		throw error;
	}
}

// Alternative: Create an API endpoint for client-side fetching
export async function fetchBlogsViaAPI(page: number = 1): Promise<BlogPaginationData> {
	if (!browser) {
		throw new Error('This function should only be called on the client side');
	}

	const response = await fetch(`/api/blogs?page=${page}`);

	if (!response.ok) {
		throw new Error('Failed to fetch blogs');
	}

	return response.json();
}
