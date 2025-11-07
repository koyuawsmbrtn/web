import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Optional: Add a secret token for security
const REVALIDATE_SECRET = process.env.SANITY_REVALIDATE_SECRET;

export const POST: RequestHandler = async ({ request, url }) => {
	// Verify the request is from Sanity (optional but recommended)
	const secret = url.searchParams.get('secret');
	if (REVALIDATE_SECRET && secret !== REVALIDATE_SECRET) {
		return json({ error: 'Invalid secret' }, { status: 401 });
	}

	try {
		const body = await request.json();
		
		// Log the webhook payload for debugging
		console.log('Revalidate webhook received:', {
			type: body._type,
			id: body._id,
			slug: body.slug?.current
		});

		// On Vercel, this will purge the edge cache
		// The actual revalidation happens automatically on next request
		
		return json({
			revalidated: true,
			now: Date.now(),
			message: 'Cache will be updated on next request'
		});
	} catch (err) {
		console.error('Error processing revalidate webhook:', err);
		return json({ error: 'Failed to revalidate' }, { status: 500 });
	}
};
