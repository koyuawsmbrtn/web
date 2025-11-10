import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverClient } from '$lib/server/sanity';
import { createNotesIndexParticle } from '$lib/helper/particle-converter';

export const GET: RequestHandler = async () => {
	try {
		console.log('Fetching notes for particle format...');
		
		const notes = await serverClient.fetch(`
			*[_type == "note" && !(_id in path("drafts.**"))] | order(publishedAt desc) [0...20] {
				_id,
				title,
				description,
				slug,
				publishedAt,
				"tags": tags[]->title
			}
		`);
		
		console.log('Notes fetched:', notes?.length || 0);
		
		const particleDoc = createNotesIndexParticle(notes || []);
		
		return json(particleDoc, {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=300'
			}
		});
	} catch (error) {
		console.error('Error generating notes.json:', error);
		console.error('Error details:', {
			message: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined
		});
		
		return json({
			format: 'particle',
			title: 'Notes Error',
			content: [{
				type: 'paragraph',
				text: `Sorry, the notes could not be loaded: ${error instanceof Error ? error.message : 'Unknown error'}`,
				style: { 'text-align': 'center' }
			}]
		}, { status: 500 });
	}
};