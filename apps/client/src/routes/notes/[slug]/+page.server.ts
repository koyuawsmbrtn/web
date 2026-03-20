import type { ServerLoadEvent } from '@sveltejs/kit';
import { serverClient } from '$lib/server/sanity';
import { error } from '@sveltejs/kit';

const NOTE_QUERY = `*[_type == "note" && slug.current == $slug][0]{
    _id,
    _type,
    _createdAt,
    _updatedAt,
    _rev,
    title,
    slug,
    tags,
    publishedAt,
    body,
    image,
    hidden,
    sortOrder
}`;

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

export async function load({ params }: ServerLoadEvent) {
	const { slug } = params;

	if (!slug) {
		throw error(404, 'Slug not found');
	}

	try {
		const note = await serverClient.fetch(NOTE_QUERY, { slug });

		if (!note) {
			throw error(404, 'Note not found');
		}

		const description = extractDescription(note.body);

		return {
			note,
			meta: {
				title: note.title,
				description,
				url: `/notes/${note.slug?.current}`,
				publishedAt: note.publishedAt,
				tags: note.tags
			}
		};
	} catch (err: unknown) {
		// Re-throw SvelteKit errors (like the 404 above) as-is
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		console.error('Error fetching note:', err);
		throw error(500, 'Failed to load note');
	}
}
