import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Simple test endpoint for particle format
export const GET: RequestHandler = async () => {
	const sampleParticle = {
		format: 'particle',
		title: 'Test Page',
		content: [
			{
				type: 'paragraph',
				text: '*Welcome to the particle format test!*',
				style: {
					'text-align': 'center',
					'margin-bottom': 30
				}
			},
			{
				type: 'paragraph',
				text: 'This is a test of the dynamic JSON generation.\nIt supports line breaks and *basic styling!*'
			},
			{
				type: 'button',
				label: 'Go to Blog',
				action: '/blog/'
			},
			{
				type: 'separator'
			},
			{
				type: 'list',
				items: [
					'*Feature 1:* Dynamic content from Sanity',
					'*Feature 2:* Automatic JSON generation',
					'*Feature 3:* Particle format compliance'
				]
			}
		]
	};

	return json(sampleParticle, {
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'public, max-age=300'
		}
	});
};