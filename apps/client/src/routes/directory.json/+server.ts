import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createDirectoryParticle } from '$lib/helper/particle-converter';
import { serverClient } from '$lib/server/sanity';

export const GET: RequestHandler = async () => {
	try {
		// Fetch directory items from Sanity
		const items = await serverClient.fetch(`
			*[_type == "directoryItem"] | order(title asc) {
				title,
				url
			}
		`);

		const particleDoc = createDirectoryParticle(items);
		
		return json(particleDoc, {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=300'
			}
		});
	} catch (error) {
		console.error('Error generating directory.json:', error);
		return json({
			format: 'particle',
			title: 'Directory Error',
			content: [{
				type: 'paragraph',
				text: 'Sorry, the directory could not be loaded.',
				style: { 'text-align': 'center' }
			}, {
				type: 'button',
				label: 'Back to Home',
				action: '/'
			}]
		}, { status: 500 });
	}
};
