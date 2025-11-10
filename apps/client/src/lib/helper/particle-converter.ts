// Simple interface for Portable Text blocks
interface PortableTextBlock {
	_type: string;
	_key?: string;
	children?: any[];
	style?: string;
	[key: string]: any;
}

export interface ParticleContent {
	type: 'paragraph' | 'list' | 'blockquote' | 'button' | 'separator' | 'image' | 'reel';
	text?: string;
	items?: string[];
	label?: string;
	'pre-label'?: string;
	action?: string;
	width?: number;
	height?: number;
	pixels?: string;
	frames?: string[];
	'frame-duration'?: number;
	style?: {
		'text-align'?: 'left' | 'center' | 'right';
		'margin-top'?: number;
		'margin-bottom'?: number;
		scale?: number;
	};
}

export interface ParticleDocument {
	format: 'particle';
	title: string;
	content: ParticleContent[];
}

interface LastFmTrack {
	name: string;
	url: string;
	artist: {
		'#text': string;
	};
	image: Array<{
		'#text': string;
		size: string;
	}>;
	date?: {
		uts: string;
		'#text': string;
	};
	'@attr'?: {
		nowplaying: string;
	};
}

interface LastFmResponse {
	recenttracks: {
		track: LastFmTrack[];
	};
}

/**
 * Sanitizes text by removing invisible Unicode characters while preserving line breaks
 */
function sanitizeText(text: string): string {
	if (!text) return '';
	
	// Preserve line breaks by using a very unique placeholder
	const lineBreakPlaceholder = '__PRESERVE_LINEBREAK_9876__';
	let sanitized = text.replace(/\n/g, lineBreakPlaceholder);
	
	// Remove zero-width characters and other problematic Unicode
	sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF\u2060-\u206F]/g, '');
	
	// Remove control characters but be very careful about line breaks
	sanitized = sanitized.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');
	
	// Normalize multiple spaces to single spaces
	sanitized = sanitized.replace(/[ \t]+/g, ' ');
	
	// Restore line breaks as regular \\n
	sanitized = sanitized.replace(new RegExp(lineBreakPlaceholder, 'g'), '\\n');
	
	// Clean up extra spaces around line breaks
	sanitized = sanitized.replace(/ *\\n */g, '\\n');

	return sanitized.trim();
}

/**
 * Fetches current/recent track from Last.fm and formats for Particle
 */
async function fetchLastFmNowPlaying(): Promise<ParticleContent | null> {
	try {
		const LASTFM_API_KEY = "d74f9fdb9c79a50ffac2ca0700892ca1";
		const username = "bubblineyuri";
		
		const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&format=json&api_key=${LASTFM_API_KEY}&limit=1&user=${username}`;
		
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data: LastFmResponse = await response.json();
		const lastTrack = data.recenttracks.track[0];

		if (!lastTrack) {
			return null;
		}

		const isNowPlaying = lastTrack['@attr']?.nowplaying === 'true';
		const artist = sanitizeText(lastTrack.artist['#text']);
		const song = sanitizeText(lastTrack.name);
		
		return {
			type: 'paragraph',
			text: `${artist} – ${song}\nPulled from last.fm (bubblineyuri)`,
		};
	} catch (error) {
		console.error('Failed to fetch Last.fm data:', error);
		return null;
	}
}

/**
 * Processes text content that may contain line breaks for Particle format
 */
function processTextWithLineBreaks(text: string): string {
	if (!text) return '';
	
	// First sanitize the text while preserving line breaks
	const sanitized = sanitizeText(text);
	
	// Particle format supports \n for line breaks, so we preserve them
	return sanitized;
}

/**
 * Converts Sanity Portable Text to Particle format text
 */
function convertPortableTextToParticle(blocks: PortableTextBlock[]): string {
	if (!blocks || !Array.isArray(blocks)) return '';

	return blocks
		.map(block => {
			if (block._type === 'block' && block.children) {
				return block.children
					.map((child: any) => {
						if (typeof child === 'object' && 'text' in child) {
							let text = child.text || '';
							
							// Preserve line breaks before sanitization
							text = sanitizeText(text);
							
							// Convert marks to particle formatting
							if (child.marks && Array.isArray(child.marks)) {
								if (child.marks.includes('strong')) {
									text = `*${text}*`;
								}
								if (child.marks.includes('em')) {
									text = `_${text}_`;
								}
							}
							
							return text;
						}
						// Handle hard line breaks (Shift+Enter in Sanity editor)
						if (typeof child === 'object' && child._type === 'break') {
							return '\n';
						}
						return '';
					})
					.join('');
			}
			return '';
		})
		.filter(Boolean)
		.join('\n\n');
}

/**
 * Converts a Sanity page to Particle format
 */
export function convertPageToParticle(page: any): ParticleDocument {
	const content: ParticleContent[] = [];

	// Add page body content
	if (page.body && Array.isArray(page.body)) {
		for (const block of page.body) {
			switch (block._type) {
				case 'block':
					// Regular text blocks
					if (block.style === 'blockquote') {
						content.push({
							type: 'blockquote',
							text: processTextWithLineBreaks(convertPortableTextToParticle([block]))
						});
					} else {
						const text = convertPortableTextToParticle([block]);
						if (text) {
							// Split text on line breaks and create separate paragraphs
							const lines = text.split('\\n').map(line => line.trim()).filter(line => line);
							for (const line of lines) {
								const processedText = processTextWithLineBreaks(line);
								if (processedText) {
									content.push({
										type: 'paragraph',
										text: processedText,
										style: block.style === 'center' ? { 'text-align': 'center' } : undefined
									});
								}
							}
						}
					}
					break;

				case 'callout':
					// Convert callouts to blockquotes
					content.push({
						type: 'blockquote',
						text: processTextWithLineBreaks(block.text || 'Callout')
					});
					break;

				case 'separator':
					content.push({
						type: 'separator'
					});
					break;

				case 'image':
					// For now, add a placeholder for images
					// You could extend this to convert actual images to pixel art
					content.push({
						type: 'paragraph',
						text: `[Image: ${block.alt || 'Untitled'}]`,
						style: { 'text-align': 'center' }
					});
					break;

				default:
					// Handle unknown blocks as paragraphs
					if (block.text) {
						content.push({
							type: 'paragraph',
							text: processTextWithLineBreaks(block.text)
						});
					}
					break;
			}
		}
	}

	return {
		format: 'particle',
		title: sanitizeText(page.title) || 'Untitled Page',
		content
	};
}

/**
 * Converts a blog post to Particle format
 */
export function convertBlogPostToParticle(post: any): ParticleDocument {
	const content: ParticleContent[] = [];

	// Add publication date if available
	if (post.publishedAt) {
		const date = new Date(post.publishedAt).toLocaleDateString();
		content.push({
			type: 'paragraph',
			text: `Published: ${date}`,
			style: { 'text-align': 'center', 'margin-bottom': 30 }
		});
	}

	// Add tags if available
	if (post.tags && post.tags.length > 0) {
		content.push({
			type: 'paragraph',
			text: `Tags: ${post.tags.join(', ')}`,
			style: { 'text-align': 'center', 'margin-bottom': 20 }
		});
	}

	// Add separator
	content.push({ type: 'separator' });

	// Add main content
	const pageContent = convertPageToParticle(post);
	content.push(...pageContent.content);

	// Add back button
	content.push(
		{ type: 'separator' },
		{
			type: 'button',
			label: 'Back to Blog',
			action: '/blog.json'
		}
	);

	return {
		format: 'particle',
		title: sanitizeText(post.title) || 'Blog Post',
		content
	};
}

/**
 * Creates an index page with navigation
 */
export function createIndexParticle(settings: any, navigation: any[]): ParticleDocument {
	const content: ParticleContent[] = [];

	// Welcome message
	content.push({
		type: 'paragraph',
		text: `*Welcome to ${sanitizeText(settings?.websiteName) || 'our website'}!*`,
		style: { 'text-align': 'center', 'margin-bottom': 30 }
	});

	if (settings?.websiteDescription) {
		content.push({
			type: 'paragraph',
			text: processTextWithLineBreaks(sanitizeText(settings.websiteDescription)),
			style: { 'text-align': 'center', 'margin-bottom': 30 }
		});
	}

	content.push({ type: 'separator' });

	// Navigation buttons
	for (const item of navigation) {
		content.push({
			type: 'button',
			label: sanitizeText(item.name),
			action: item.url || '/'
		});
	}

	return {
		format: 'particle',
		title: sanitizeText(settings?.websiteName) || 'Website',
		content
	};
}

/**
 * Creates a now playing page with Last.fm data
 */
export async function createNowParticle(page?: any): Promise<ParticleDocument> {
	const content: ParticleContent[] = [];

	// Add page content if available
	if (page && page.body) {
		const pageContent = convertPageToParticle(page);
		content.push(...pageContent.content);
	} else {
		// Fallback title if no page content
		content.push({
			type: 'paragraph',
			text: '*Now Playing*',
			style: { 'text-align': 'center', 'margin-bottom': 30 }
		});
	}

	// Add now playing information
	try {
		const nowPlaying = await fetchLastFmNowPlaying();
		if (nowPlaying) {
			content.push(nowPlaying);
		} else {
			content.push({
				type: 'paragraph',
				text: 'No recent tracks found.',
				style: { 'text-align': 'center' }
			});
		}
	} catch (error) {
		console.error('Error fetching now playing info:', error);
		content.push({
			type: 'paragraph',
			text: 'Unable to load now playing information.',
			style: { 'text-align': 'center' }
		});
	}

	// Back button
	content.push(
		{ type: 'separator' },
		{
			type: 'button',
			label: 'Back to Home',
			action: '/'
		}
	);

	return {
		format: 'particle',
		title: page?.title ? sanitizeText(page.title) : 'Now Playing',
		content
	};
}

/**
 * Converts a note to Particle format
 */
export function convertNoteToParticle(note: any): ParticleDocument {
	const content: ParticleContent[] = [];

	// Add publication date if available
	if (note.publishedAt) {
		const date = new Date(note.publishedAt).toLocaleDateString();
		content.push({
			type: 'paragraph',
			text: `Published: ${date}`,
			style: { 'text-align': 'center', 'margin-bottom': 30 }
		});
	}

	// Add tags if available
	if (note.tags && note.tags.length > 0) {
		content.push({
			type: 'paragraph',
			text: `Tags: ${note.tags.join(', ')}`,
			style: { 'text-align': 'center', 'margin-bottom': 20 }
		});
	}

	// Add separator
	content.push({ type: 'separator' });

	// Add main content
	const pageContent = convertPageToParticle(note);
	content.push(...pageContent.content);

	// Add back button
	content.push(
		{ type: 'separator' },
		{
			type: 'button',
			label: 'Back to Notes',
			action: '/notes.json'
		}
	);

	return {
		format: 'particle',
		title: sanitizeText(note.title) || 'Note',
		content
	};
}

/**
 * Creates a notes index page
 */
export function createNotesIndexParticle(notes: any[]): ParticleDocument {
	const content: ParticleContent[] = [];

	content.push({
		type: 'paragraph',
		text: '*Notes*',
		style: { 'text-align': 'center', 'margin-bottom': 30 }
	});

	console.log('Creating notes index with notes:', notes?.length || 0);

	if (!notes || notes.length === 0) {
		content.push({
			type: 'paragraph',
			text: 'No notes found yet. Check back later!',
			style: { 'text-align': 'center' }
		});
	} else {
		content.push({ type: 'separator' });

		for (const note of notes) {
			console.log('Processing note:', note?._id, note?.title);
			
			// Add note title and excerpt
			content.push({
				type: 'paragraph',
				text: `*${sanitizeText(note?.title) || 'Untitled Note'}*`
			});

			if (note?.description) {
				content.push({
					type: 'paragraph',
					text: processTextWithLineBreaks(sanitizeText(note.description)),
					style: { 'margin-top': 10 }
				});
			}

			if (note?.publishedAt) {
				const date = new Date(note.publishedAt).toLocaleDateString();
				content.push({
					type: 'paragraph',
					text: `Published: ${date}`,
					style: { 'margin-top': 5, 'margin-bottom': 15 }
				});
			}

			const slug = note?.slug?.current || note?.slug;
			if (slug) {
				content.push({
					type: 'button',
					label: 'Read More',
					action: `/notes/${slug}.json`
				});
			}

			content.push({ type: 'separator' });
		}
	}

	// Back to home button
	content.push({
		type: 'button',
		label: 'Back to Home',
		action: '/'
	});

	return {
		format: 'particle',
		title: 'Notes',
		content
	};
}

/**
 * Creates a blog index page
 */
export function createBlogIndexParticle(posts: any[]): ParticleDocument {
	const content: ParticleContent[] = [];

	content.push({
		type: 'paragraph',
		text: '*Blog Posts*',
		style: { 'text-align': 'center', 'margin-bottom': 30 }
	});

	console.log('Creating blog index with posts:', posts?.length || 0);

	if (!posts || posts.length === 0) {
		content.push({
			type: 'paragraph',
			text: 'No blog posts found yet. Check back later!',
			style: { 'text-align': 'center' }
		});
	} else {
		content.push({ type: 'separator' });

		for (const post of posts) {
			console.log('Processing post:', post?._id, post?.title);
			
			// Add post title and excerpt
			content.push({
				type: 'paragraph',
				text: `*${sanitizeText(post?.title) || 'Untitled Post'}*`
			});

			if (post?.description) {
				content.push({
					type: 'paragraph',
					text: processTextWithLineBreaks(sanitizeText(post.description)),
					style: { 'margin-top': 10 }
				});
			}

			if (post?.publishedAt) {
				const date = new Date(post.publishedAt).toLocaleDateString();
				content.push({
					type: 'paragraph',
					text: `Published: ${date}`,
					style: { 'margin-top': 5, 'margin-bottom': 15 }
				});
			}

			const slug = post?.slug?.current || post?.slug;
			if (slug) {
				content.push({
					type: 'button',
					label: 'Read More',
					action: `/blog/${slug}.json`
				});
			}

			content.push({ type: 'separator' });
		}
	}

	// Back to home button
	content.push({
		type: 'button',
		label: 'Back to Home',
		action: '/'
	});

	return {
		format: 'particle',
		title: 'Blog',
		content
	};
}

/**
 * Creates a contact page with contact information
 */
export function createContactParticle(): ParticleDocument {
	const content: ParticleContent[] = [
		{
			type: 'paragraph',
			text: '*Contact Information*',
			style: { 'text-align': 'center', 'margin-bottom': 30 }
		},
		{
			type: 'list',
			items: [
				'*E-Mail:* me@koyu.space',
				'*Signal:* bubblineyuri.16'
			]
		},
		{ type: 'separator' },
		{
			type: 'button',
			label: 'Back to Home',
			action: '/'
		}
	];

	return {
		format: 'particle',
		title: 'Contact',
		content
	};
}