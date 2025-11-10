import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createAboutParticle } from '$lib/helper/particle-converter';
import { serverClient } from '$lib/server/sanity';

export const GET: RequestHandler = async () => {
	try {
		// Fetch the "about" page from Sanity
		const aboutPage = await serverClient.fetch(`
			*[_type == "page" && slug.current == "about"][0] {
				_id,
				title,
				description,
				slug,
				body,
				image {
					asset-> {
						_id,
						url
					},
					alt
				}
			}
		`);
		
		const particleDoc = await createAboutParticle(aboutPage);
		
		return json(particleDoc, {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
			}
		});
	} catch (error) {
		console.error('Error generating about.json:', error);
		return json({
			format: 'particle',
			title: 'Error',
			content: [{
				type: 'paragraph',
				text: 'Sorry, the about page could not be loaded.',
				style: { 'text-align': 'center' }
			}, {
				type: 'button',
				label: 'Back to Home',
				action: '/'
			}]
		}, { status: 500 });
	}
};