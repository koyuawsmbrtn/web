import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverClient } from '$lib/server/sanity';
import { convertPageToParticle } from '$lib/helper/particle-converter';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { slug } = params;
		
		if (!slug) {
			return json({
				format: 'particle',
				title: 'Error',
				content: [{
					type: 'paragraph',
					text: 'No page specified.',
					style: { 'text-align': 'center' }
				}]
			}, { status: 400 });
		}
		
		const page = await serverClient.fetch(`
			*[_type == "page" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
				_id,
				title,
				description,
				slug,
				body
			}
		`, { slug });
		
		if (!page) {
			return json({
				format: 'particle',
				title: 'Page Not Found',
				content: [
					{
						type: 'paragraph',
						text: 'The requested page could not be found.',
						style: { 'text-align': 'center' }
					},
					{
						type: 'button',
						label: 'Back to Home',
						action: '/'
					}
				]
			}, { status: 404 });
		}
		
		const particleDoc = convertPageToParticle(page);
		
		return json(particleDoc, {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=300'
			}
		});
	} catch (error) {
		console.error('Error generating page JSON:', error);
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