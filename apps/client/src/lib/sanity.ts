import { sanityConnection } from '@repo/sanity-connection';
import { createClient } from '@sanity/client';

export const client = createClient({
	projectId: sanityConnection.projectId,
	dataset: sanityConnection.dataset,
	apiVersion: '2024-12-01',
	useCdn: true, // CRITICAL: Use CDN for better performance in production
	token: sanityConnection.publicViewerToken,
	ignoreBrowserTokenWarning: true,
	stega: {
		enabled: true,
		studioUrl: sanityConnection.studioUrl
	}
});
