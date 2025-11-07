import { createRequestHandler, setServerClient } from '@sanity/svelte-loader';
import { serverClient } from '$lib/server/sanity';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

setServerClient(serverClient);

const sanityHandle = createRequestHandler();

// Add caching headers for better performance
const cacheHandle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	
	// Add cache headers for static pages (adjust as needed)
	if (event.url.pathname.startsWith('/blog') || 
	    event.url.pathname === '/' ||
	    event.url.pathname.match(/^\/[^/]+$/)) {
		response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400');
	}
	
	return response;
};

export const handle = sequence(sanityHandle, cacheHandle);