import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverClient } from '$lib/server/sanity';
import { convertBlogPostToParticle } from '$lib/helper/particle-converter';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { slug } = params;
		
		if (!slug) {
			return json({
				format: 'particle',
				title: 'Error',
				content: [{
					type: 'paragraph',
					text: 'No blog post specified.',
					style: { 'text-align': 'center' }
				}]
			}, { status: 400 });
		}
		
		const post = await serverClient.fetch(`
			*[_type == "post" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
				_id,
				title,
				description,
				slug,
				publishedAt,
				body,
				"tags": tags[]->title
			}
		`, { slug });
		
		if (!post) {
			return json({
				format: 'particle',
				title: 'Post Not Found',
				content: [
					{
						type: 'paragraph',
						text: 'The requested blog post could not be found.',
						style: { 'text-align': 'center' }
					},
					{
						type: 'button',
						label: 'Back to Blog',
						action: '/blog.json'
					}
				]
			}, { status: 404 });
		}
		
		const particleDoc = convertBlogPostToParticle(post);
		
		return json(particleDoc, {
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=300'
			}
		});
	} catch (error) {
		console.error('Error generating blog post JSON:', error);
		return json({
			format: 'particle',
			title: 'Error',
			content: [{
				type: 'paragraph',
				text: 'Sorry, this blog post could not be loaded.',
				style: { 'text-align': 'center' }
			}]
		}, { status: 500 });
	}
};