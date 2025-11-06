import { getImageDimensions, type SanityImageDimensions } from '@sanity/asset-utils';
import type { ImageWithAlt } from '../sanity.types';
import { generateImageUrl } from './image-url';
import { serverClient } from '../server/sanity';

export type SimpleImage = {
	url: string;
	alt: string;
	dimensions: SanityImageDimensions;
};

async function fetchImage(assetRef: string | undefined): Promise<ImageWithAlt | null> {
	if (!assetRef) return null;

	const image = await serverClient.fetch(`*[_id == $id][0]`, { id: assetRef });
	return image;
}

function getDimensions(image: ImageWithAlt | any): SanityImageDimensions {
	try {
		if (image._type === 'imageWithAlt') {
			const compatibleImage = { ...image, asset: image.asset };
			return getImageDimensions(compatibleImage as any);
		}
		return getImageDimensions(image);
	} catch {
		return { width: 1200, height: 800, aspectRatio: 1.5 };
	}
}

export async function getImage(assetRef: string | undefined): Promise<SimpleImage> {
	const image = await fetchImage(assetRef);
	if (!image)
		return { url: '', alt: '', dimensions: { width: 0, height: 0, aspectRatio: 1 } };

	const dimensions = getDimensions(image);

	return {
		url: generateImageUrl(image),
		alt: image.alt || '',
		dimensions
	};
}

export async function getImages(assetRefs: (string | undefined)[]): Promise<SimpleImage[]> {
	return Promise.all(assetRefs.map((ref) => getImage(ref)));
}
