import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverClient } from '$lib/server/sanity';
import { convertNoteToParticle } from '$lib/helper/particle-converter';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { slug } = params;
		
		if (!slug) {
			return json({
				format: 'particle',
				title: 'Error',
				content: [{
					type: 'paragraph',
					text: 'No note specified.',
					style: { 'text-align': 'center' }
				}]
			}, { status: 400 });
		}
		
		const note = await serverClient.fetch(`
			*[_type == "note" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
				_id,
				title,
				description,
				slug,
				publishedAt,
				body,
				"tags": tags[]->title
			}
		`, { slug });
		
		if (!note) {
			return json({
				format: 'particle',
				title: 'Note Not Found',
				content: [
					{
						type: 'paragraph',
						text: 'The requested note could not be found.',
						style: { 'text-align': 'center' }
					},
					{
						type: 'button',
						label: 'Back to Notes',
						action: '/notes.json'
					}
				]
			}, { status: 404 });
		}
		
		const particleDoc = convertNoteToParticle(note);
		
		return json(particleDoc, {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=300'
			}
		});
	} catch (error) {
		console.error('Error generating note JSON:', error);
		return json({
			format: 'particle',
			title: 'Error',
			content: [{
				type: 'paragraph',
				text: 'Sorry, this note could not be loaded.',
				style: { 'text-align': 'center' }
			}]
		}, { status: 500 });
	}
};