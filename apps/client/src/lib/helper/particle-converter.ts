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
		const LASTFM_API_KEY = 'd74f9fdb9c79a50ffac2ca0700892ca1';
		const username = 'bubblineyuri';

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
			text: `${artist} – ${song}\nPulled from last.fm (bubblineyuri)`
		};
	} catch (error) {
		console.error('Failed to fetch Last.fm data:', error);
		return null;
	}
}

/**
 * Converts an image URL to a particle image format by fetching and processing it
 */
async function convertImageToParticle(imageUrl: string, alt?: string): Promise<ParticleContent> {
	try {
		// Import Sharp for server-side image processing
		const sharp = await import('sharp');

		// Fetch the image
		const response = await fetch(imageUrl);
		if (!response.ok) {
			throw new Error(`Failed to fetch image: ${response.status}`);
		}

		const imageBuffer = await response.arrayBuffer();

		// Define target dimensions to fit within Particle limits (400x260 max)
		const maxWidth = 200; // Conservative width
		const maxHeight = 150; // Conservative height

		// Process image with Sharp - just scale it down
		const processedImage = sharp
			.default(Buffer.from(imageBuffer))
			.resize(maxWidth, maxHeight, {
				fit: 'inside',
				withoutEnlargement: true
			})
			.greyscale()
			.raw();

		// Get image metadata and raw pixel data
		const { data, info } = await processedImage.toBuffer({ resolveWithObject: true });
		const { width, height } = info;

		if (!width || !height) {
			throw new Error('Could not determine image dimensions');
		}

		// Convert to 1-bit using Floyd-Steinberg dithering
		const pixels = floydSteinbergDithering(data, width, height);

		// Convert to Particle pixel format with optimization
		let pixelString = '';
		for (let y = 0; y < height; y++) {
			let linePixels = '';
			for (let x = 0; x < width; x++) {
				const pixelIndex = y * width + x;
				linePixels += pixels[pixelIndex];
			}

			// Optimize using run-length encoding for repeated pixels
			const optimizedLine = optimizePixelLine(linePixels);
			pixelString += optimizedLine;

			// Add line break except for last line
			if (y < height - 1) {
				pixelString += ' ';
			}
		}

		// Calculate appropriate scale (default 2, max 4)
		let scale = 2;
		while (scale < 4 && width * scale <= 400 && height * scale <= 200) {
			scale++;
		}
		// Step back if we went over
		if (width * scale > 400 || height * scale > 200) {
			scale--;
		}

		return {
			type: 'image',
			width,
			height,
			pixels: pixelString,
			style: {
				scale,
				'margin-top': 20,
				'margin-bottom': 20
			}
		};
	} catch (error) {
		console.error('Error converting image:', error);
		// Return a text fallback
		return {
			type: 'paragraph',
			text: `[Image: ${alt || 'Untitled'}]`,
			style: { 'text-align': 'center' }
		};
	}
}

/**
 * Applies Floyd-Steinberg dithering to convert grayscale to 1-bit black/white
 */
function floydSteinbergDithering(data: Buffer, width: number, height: number): string[] {
	// Create a copy of the data as floating point for error propagation
	const pixels = new Float32Array(width * height);
	for (let i = 0; i < data.length; i++) {
		pixels[i] = data[i] ?? 0;
	}

	const result: string[] = new Array(width * height);

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const index = y * width + x;
			const oldPixel = pixels[index] ?? 0;

			// Quantize to 0 or 255
			const newPixel = oldPixel < 128 ? 0 : 255;

			// Store result as '1' for black (0), '0' for white (255)
			result[index] = newPixel === 0 ? '1' : '0';

			// Calculate quantization error
			const error = oldPixel - newPixel;

			// Distribute error to neighboring pixels using Floyd-Steinberg weights
			if (x + 1 < width) {
				const rightIndex = y * width + (x + 1);
				if (pixels[rightIndex] !== undefined) {
					pixels[rightIndex] += (error * 7) / 16; // Right
				}
			}
			if (y + 1 < height) {
				if (x - 1 >= 0) {
					const bottomLeftIndex = (y + 1) * width + (x - 1);
					if (pixels[bottomLeftIndex] !== undefined) {
						pixels[bottomLeftIndex] += (error * 3) / 16; // Bottom-left
					}
				}
				const bottomIndex = (y + 1) * width + x;
				if (pixels[bottomIndex] !== undefined) {
					pixels[bottomIndex] += (error * 5) / 16; // Bottom
				}
				if (x + 1 < width) {
					const bottomRightIndex = (y + 1) * width + (x + 1);
					if (pixels[bottomRightIndex] !== undefined) {
						pixels[bottomRightIndex] += (error * 1) / 16; // Bottom-right
					}
				}
			}
		}
	}

	return result;
}

/**
 * Optimizes a line of pixels using run-length encoding
 * Converts sequences like "1111" to "D" and "0000" to "d"
 */
function optimizePixelLine(line: string): string {
	if (!line) return '';

	let optimized = '';
	let currentChar = line[0];
	let count = 1;

	for (let i = 1; i < line.length; i++) {
		if (line[i] === currentChar && count < 26) {
			count++;
		} else {
			// Add the optimized sequence
			if (count >= 4) {
				// Use letter encoding for runs of 4 or more
				const letter = String.fromCharCode(97 + count - 1); // a=1, b=2, etc.
				optimized += currentChar === '1' ? letter.toUpperCase() : letter;
			} else {
				// Use regular notation for short runs
				optimized += currentChar?.repeat(count) ?? '';
			}

			currentChar = line[i];
			count = 1;
		}
	}

	// Handle the last sequence
	if (count >= 4) {
		const letter = String.fromCharCode(97 + count - 1);
		optimized += currentChar === '1' ? letter.toUpperCase() : letter;
	} else {
		optimized += currentChar?.repeat(count) ?? '';
	}

	return optimized;
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
		.map((block) => {
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
export async function convertPageToParticle(page: any): Promise<ParticleDocument> {
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
							const lines = text
								.split('\\n')
								.map((line) => line.trim())
								.filter((line) => line);
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
					// Convert image to particle format
					if (block.asset) {
						// Extract image URL from Sanity asset reference
						let imageUrl = block.asset.url || block.asset._ref;

						// If we have a Sanity asset reference, construct the URL
						if (imageUrl && imageUrl.startsWith('image-')) {
							const [, assetId, dimensions, format] = imageUrl.split('-');
							imageUrl = `https://cdn.sanity.io/images/qo2xqopm/production/${assetId}-${dimensions}.${format}`;
						}

						if (imageUrl) {
							try {
								const particleImage = await convertImageToParticle(imageUrl, block.alt);
								content.push(particleImage);
							} catch (error) {
								console.error('Error converting image:', error);
								content.push({
									type: 'paragraph',
									text: `[Image: ${block.alt || 'Untitled'}]`,
									style: { 'text-align': 'center' }
								});
							}
						} else {
							content.push({
								type: 'paragraph',
								text: `[Image: ${block.alt || 'Untitled'}]`,
								style: { 'text-align': 'center' }
							});
						}
					} else {
						content.push({
							type: 'paragraph',
							text: `[Image: ${block.alt || 'Untitled'}]`,
							style: { 'text-align': 'center' }
						});
					}
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
export async function convertBlogPostToParticle(post: any): Promise<ParticleDocument> {
	const content: ParticleContent[] = [];

	// Add title image if available
	if (post.image) {
		try {
			// Extract image URL from Sanity asset
			let imageUrl = '';
			if (typeof post.image === 'string') {
				imageUrl = post.image;
			} else if (post.image.asset) {
				imageUrl = post.image.asset.url || post.image.asset._ref;
				// If we have a Sanity asset reference, construct the URL
				if (imageUrl && imageUrl.startsWith('image-')) {
					const [, assetId, dimensions, format] = imageUrl.split('-');
					imageUrl = `https://cdn.sanity.io/images/qo2xqopm/production/${assetId}-${dimensions}.${format}`;
				}
			}

			if (imageUrl) {
				const titleImage = await convertImageToParticle(imageUrl, post.image.alt || post.title);
				content.push(titleImage);
				content.push({ type: 'separator' });
			}
		} catch (error) {
			console.error('Error processing blog post title image:', error);
		}
	}

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

	// Add separator before main content
	content.push({ type: 'separator' });

	// Add main content
	const pageContent = await convertPageToParticle(post);
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
		if (item.name.toLowerCase() === 'home') {
			content.push({
				type: 'button',
				label: 'About',
				action: '/about.json'
			});
		}
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
		const pageContent = await convertPageToParticle(page);
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
export async function convertNoteToParticle(note: any): Promise<ParticleDocument> {
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
	const pageContent = await convertPageToParticle(note);
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
 * Creates an about page with cover image support
 */
export async function createAboutParticle(page?: any): Promise<ParticleDocument> {
	const content: ParticleContent[] = [];

	// Add cover image if available (similar to blog posts)
	if (page?.image) {
		try {
			// Extract image URL from Sanity asset
			let imageUrl = '';
			if (typeof page.image === 'string') {
				imageUrl = page.image;
			} else if (page.image.asset) {
				imageUrl = page.image.asset.url || page.image.asset._ref;
				// If we have a Sanity asset reference, construct the URL
				if (imageUrl && imageUrl.startsWith('image-')) {
					const [, assetId, dimensions, format] = imageUrl.split('-');
					imageUrl = `https://cdn.sanity.io/images/qo2xqopm/production/${assetId}-${dimensions}.${format}`;
				}
			}

			if (imageUrl) {
				const coverImage = await convertImageToParticle(imageUrl, page.image.alt || page.title);
				content.push(coverImage);
				content.push({ type: 'separator' });
			}
		} catch (error) {
			console.error('Error processing about page cover image:', error);
		}
	}

	// Add page content if available
	if (page && page.body) {
		const pageContent = await convertPageToParticle(page);
		content.push(...pageContent.content);
	} else {
		// Fallback content if no page found
		content.push({
			type: 'paragraph',
			text: '*About*',
			style: { 'text-align': 'center', 'margin-bottom': 30 }
		});
		content.push({
			type: 'paragraph',
			text: 'About page content not found.',
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
		title: page?.title ? sanitizeText(page.title) : 'About',
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
			items: ['*E-Mail:* me@koyu.space', '*Signal:* bubblineyuri.16']
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
