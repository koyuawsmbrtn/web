import type { PageServerLoad } from './$types';
import { serverClient } from '$lib/server/sanity';
import type { Blog } from '$lib/sanity.types';
import { error } from '@sveltejs/kit';

const BLOG_QUERY = `*[_type == "post" && slug.current == $slug][0]{
	_id,
	_type,
	_createdAt,
	_updatedAt,
	_rev,
	title,
	slug,
	author,
	publishedAt,
	tags,
	body,
	excerpt,
	image
}`;

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;

	if (!slug) {
		throw error(404, 'Slug not found');
	}

	try {
		const blog: Blog = await serverClient.fetch(BLOG_QUERY, { slug });

		if (!blog) {
			throw error(404, 'Blog post not found');
		}

		// Extract description from first block if no excerpt exists
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
			blog,
			meta: {
				title: blog.title,
				description,
				url: `/blog/${blog.slug?.current}`,
				publishedAt: blog.publishedAt,
				author: blog.author,
				tags: blog.tags
			}
		};
	} catch (err) {
		console.error('Error fetching blog post:', err);
		throw error(500, 'Failed to load blog post');
	}
};
