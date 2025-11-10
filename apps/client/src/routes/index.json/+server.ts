import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchSettings } from '$lib/settings';
import { getCachedNavigation } from '$lib/helper/navigation';
import { createIndexParticle } from '$lib/helper/particle-converter';

export const GET: RequestHandler = async () => {
	try {
		const [settings, navigation] = await Promise.all([
			fetchSettings(),
			getCachedNavigation()
		]);
		
		const particleDoc = createIndexParticle(settings, navigation);
		
		return json(particleDoc, {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=300'
			}
		});
	} catch (error) {
		console.error('Error generating index.json:', error);
		return json({
			format: 'particle',
			title: 'Error',
			content: [{
				type: 'paragraph',
				text: 'Sorry, this page could not be loaded.',
				style: { 'text-align': 'center' }
			}]
		}, { status: 500 });
	}
};