import { createRequestHandler, setServerClient } from '@sanity/svelte-loader';
import { serverClient } from '$lib/server/sanity';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

setServerClient(serverClient);

const sanityHandle = createRequestHandler();

// Add caching headers for better performance
const cacheHandle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	
	// Shorter cache for dynamic content (1 minute browser, 2 minutes edge)
	if (event.url.pathname.startsWith('/blog') || 
	    event.url.pathname === '/' ||
	    event.url.pathname.match(/^\/[^/]+$/)) {
		response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300');
	}
	
	return response;
};

export const handle = sequence(sanityHandle, cacheHandle);