import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { serverClient } from '$lib/server/sanity';
import { fetchSettings } from '$lib/settings';
import { getCachedNavigation } from '$lib/helper/navigation';
import { 
	convertPageToParticle, 
	convertBlogPostToParticle, 
	createIndexParticle, 
	createBlogIndexParticle 
} from '$lib/helper/particle-converter';

// Handle dynamic JSON generation for particle format
export const GET: RequestHandler = async ({ params, url }) => {
	try {
		const path = params.path || 'index';
		
		// Remove .json extension if present
		const cleanPath = path.replace(/\.json$/, '');
		
		// Handle different routes
		if (cleanPath === 'index' || cleanPath === '') {
			return await generateIndexJSON();
		}
		
		if (cleanPath === 'blog') {
			return await generateBlogIndexJSON();
		}
		
		if (cleanPath.startsWith('blog/')) {
			const slug = cleanPath.replace('blog/', '');
			return await generateBlogPostJSON(slug);
		}
		
		// Handle regular pages
		return await generatePageJSON(cleanPath);
		
	} catch (error) {
		console.error('Error generating particle JSON:', error);
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

async function generateIndexJSON() {
	const [settings, navigation] = await Promise.all([
		fetchSettings(),
		getCachedNavigation()
	]);
	
	const particleDoc = createIndexParticle(settings, navigation);
	return json(particleDoc);
}

async function generateBlogIndexJSON() {
	const posts = await serverClient.fetch(`
		*[_type == "post"] | order(publishedAt desc) [0...10] {
			_id,
			title,
			description,
			slug,
			publishedAt,
			tags[]->title
		}
	`);
	
	const particleDoc = createBlogIndexParticle(posts);
	return json(particleDoc);
}

async function generateBlogPostJSON(slug: string) {
	const post = await serverClient.fetch(`
		*[_type == "post" && slug.current == $slug][0] {
			_id,
			title,
			description,
			slug,
			publishedAt,
			body,
			tags[]->title
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
	return json(particleDoc);
}

async function generatePageJSON(slug: string) {
	const page = await serverClient.fetch(`
		*[_type == "page" && slug.current == $slug][0] {
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
	return json(particleDoc);
}