import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createContactParticle } from '$lib/helper/particle-converter';

export const GET: RequestHandler = async () => {
	try {
		const particleDoc = createContactParticle();
		
		return json(particleDoc, {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=3600' // Cache for 1 hour since contact info doesn't change often
			}
		});
	} catch (error) {
		console.error('Error generating contact.json:', error);
		return json({
			format: 'particle',
			title: 'Error',
			content: [{
				type: 'paragraph',
				text: 'Sorry, the contact page could not be loaded.',
				style: { 'text-align': 'center' }
			}, {
				type: 'button',
				label: 'Back to Home',
				action: '/'
			}]
		}, { status: 500 });
	}
};