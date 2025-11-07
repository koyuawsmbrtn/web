import type { PageServerLoad } from './$types';
import { serverClient } from '$lib/server/sanity';
import { error } from '@sveltejs/kit';

const PAGE_QUERY = `*[_type == "page" && slug.current == $slug][0]{
	_id,
	_type,
	_createdAt,
	_updatedAt,
	_rev,
	title,
	description,
	slug,
	tags,
	publishedAt,
	body,
	image,
	hidden,
	sortOrder
}`;

// Helper function to extract description from body
function extractDescription(body: any): string | undefined {
	if (!body || !Array.isArray(body)) return undefined;
	
	const firstBlock = body[0];
	if (
		firstBlock &&
		firstBlock._type === 'block' &&
		'children' in firstBlock &&
		Array.isArray(firstBlock.children)
	) {
		return firstBlock.children
			.filter((child: any) => child.text)
			.map((child: any) => child.text)
			.join(' ')
			.slice(0, 160);
	}
	return undefined;
}

export const load: PageServerLoad = async ({ params }) => {
	const { slug } = params;

	console.log('Loading page with slug:', slug);

	if (!slug) {
		console.log('No slug provided');
		throw error(404, 'Slug not found');
	}

	try {
		console.log('Fetching page with query:', PAGE_QUERY);
		console.log('Query params:', { slug });
		
		const page = await serverClient.fetch(PAGE_QUERY, { slug });
		
		console.log('Fetched page:', page ? { title: page.title?.replace(/[\u200B-\u200D\uFEFF\u2060-\u206F]/g, ''), _id: page._id, bodyLength: page.body?.length } : 'null');

		if (!page) {
			console.log('No page found');
			throw error(404, 'Page not found');
		}

		// Extract description from first block
		const description = page.description || extractDescription(page.body);

		return {
			page, // Changed from 'custom' to 'page' for clarity
			meta: {
				title: page.title,
				description,
				url: `/${page.slug?.current}`,
				publishedAt: page.publishedAt,
				tags: page.tags
			}
		};
	} catch (err) {
		console.error('Error fetching page:', err);
		
		// Log more details about the error
		if (err instanceof Error) {
			console.error('Error message:', err.message);
			console.error('Error stack:', err.stack);
		}
		
		throw error(500, 'Failed to load page');
	}
};
