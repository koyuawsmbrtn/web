import { client } from '$lib/sanity';
import { sanityConnection } from '@repo/sanity-connection';

export const serverClient = client.withConfig({
	token: sanityConnection.publicViewerToken,
	useCdn: true // Use CDN for faster responses
});