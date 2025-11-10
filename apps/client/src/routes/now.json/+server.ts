import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createNowParticle } from '$lib/helper/particle-converter';
import { serverClient } from '$lib/server/sanity';

export const GET: RequestHandler = async () => {
	try {
		// Fetch the "now" page from Sanity
		const nowPage = await serverClient.fetch(`
			*[_type == "page" && slug.current == "now"][0] {
				_id,
				title,
				description,
				slug,
				body
			}
		`);
		
		const particleDoc = await createNowParticle(nowPage);
		
		return json(particleDoc, {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=60' // Cache for 1 minute since music changes frequently
			}
		});
	} catch (error) {
		console.error('Error generating now.json:', error);
		return json({
			format: 'particle',
			title: 'Error',
			content: [{
				type: 'paragraph',
				text: 'Sorry, the now playing page could not be loaded.',
				style: { 'text-align': 'center' }
			}, {
				type: 'button',
				label: 'Back to Home',
				action: '/'
			}]
		}, { status: 500 });
	}
};