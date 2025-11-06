import type { Link } from '../sanity.types';
import { client } from '../sanity';

interface InternalLink {
	_ref: string;
	_type: string;
	_weak?: boolean;
}

export const resolveHref = async (internalLink: InternalLink) => {
	if (!internalLink || !internalLink._ref) return null;

	const QUERY = '*[_id == $ref][0]{ _type, slug }';

	try {
		const result: any = await client.fetch(QUERY, { ref: internalLink._ref });
		return result ? { type: result._type, slug: result.slug?.current } : null;
	} catch (error) {
		console.error('Sanity query failed:', error);
		return null;
	}
};

export async function deconstructLink(
	link?: Link
): Promise<{ href: string; target: string } | null> {
	if (!link) return null;

	const { type, value, anchor, parameters, blank, url, email, phone, internalLink } = link;
	const target = blank ? '_blank' : '';
	let href: string | null = null;

	switch (type) {
		case 'static':
			href = `${value || ''}${anchor || ''}${parameters || ''}`;
			break;
		case 'external':
			href = `${url || ''}${anchor || ''}${parameters || ''}`;
			break;
		case 'email':
			href = `mailto:${email || ''}`;
			break;
		case 'phone':
			href = `tel:${phone || ''}`;
			break;
		case 'internal':
			if (internalLink) {
				const resolved = await resolveHref(internalLink);
				if (resolved) {
					href =
						resolved.type === 'custom'
							? `/${resolved.slug || ''}`
							: resolved.type === 'blog'
								? `/blog/${resolved.slug || ''}`
								: `/${resolved.type}/${resolved.slug || ''}`;
				}
			}
			break;
		default:
			return null;
	}
	if (!href) return null;
	return { href, target };
}
