import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverClient } from '$lib/server/sanity';
import { createBlogIndexParticle } from '$lib/helper/particle-converter';

export const GET: RequestHandler = async () => {
	try {
		console.log('Fetching blog posts for particle format...');
		
		const posts = await serverClient.fetch(`
			*[_type == "post" && !(_id in path("drafts.**"))] | order(publishedAt desc) [0...10] {
				_id,
				title,
				description,
				slug,
				publishedAt,
				"tags": tags[]->title
			}
		`);
		
		console.log('Blog posts fetched:', posts?.length || 0);
		
		const particleDoc = createBlogIndexParticle(posts || []);
		
		return json(particleDoc, {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=300'
			}
		});
	} catch (error) {
		console.error('Error generating blog.json:', error);
		console.error('Error details:', {
			message: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined
		});
		
		return json({
			format: 'particle',
			title: 'Blog Error',
			content: [{
				type: 'paragraph',
				text: `Sorry, the blog could not be loaded: ${error instanceof Error ? error.message : 'Unknown error'}`,
				style: { 'text-align': 'center' }
			}]
		}, { status: 500 });
	}
};