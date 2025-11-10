import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverClient } from '$lib/server/sanity';

export const GET: RequestHandler = async () => {
	try {
		console.log('Testing Sanity connection...');
		
		// Test basic connectivity first
		const testQuery = await serverClient.fetch(`*[_type == "post"][0...5] { _id, title }`);
		console.log('Basic post query result:', testQuery);
		
		// Test with full query
		const posts = await serverClient.fetch(`
			*[_type == "post"] | order(_createdAt desc) [0...10] {
				_id,
				title,
				description,
				slug,
				publishedAt,
				_createdAt,
				"tags": tags[]->title
			}
		`);
		
		console.log('Full query result:', posts);
		
		return json({
			success: true,
			testQuery,
			posts,
			clientConfig: {
				projectId: serverClient.config().projectId,
				dataset: serverClient.config().dataset,
				useCdn: serverClient.config().useCdn
			}
		});
		
	} catch (error) {
		console.error('Sanity test error:', error);
		return json({
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined
		}, { status: 500 });
	}
};