import { client } from '../sanity';
import type { ImageWithAlt, SanityImageAsset } from '../sanity.types';
import imageUrlBuilder from '@sanity/image-url';

const { projectId, dataset } = client.config();
const builder = imageUrlBuilder({ projectId: projectId ?? '', dataset: dataset ?? '' });

export function generateImageUrl(
	image: ImageWithAlt | any,
	width?: number,
	height?: number
): string {
	if (!image || !projectId || !dataset) {
		return '';
	}

	if (image.url && !image.asset) {
		return image.url;
	}

	const imageRef = image.asset?._ref || image.asset?._id || image.asset;

	if (!imageRef) {
		return '';
	}

	try {
		let imageBuilder = builder
			.image(imageRef)
			.fit('max')
			.width(width || 1920)
			.format('webp')
			.quality(85) // Reduce quality slightly for better performance
			.auto('format');
		// Cropping doesnt really work. But it is here for future reference i guess. Fucking Sanity is so retarded.
		if (image.crop && width && height) {
			const crop = image.crop;
			if (crop.top || crop.bottom || crop.left || crop.right) {
				const croppedWidth = Math.floor(width * (1 - (crop.right + crop.left)));
				const croppedHeight = Math.floor(height * (1 - (crop.top + crop.bottom)));
				const left = Math.floor(width * crop.left);
				const top = Math.floor(height * crop.top);
				imageBuilder = imageBuilder.rect(left, top, croppedWidth, croppedHeight);
			}
		}

		const url = imageBuilder.url();
		return url;
	} catch (error) {
		return '';
	}
}

export function dynamicHeight(originalHeight: number, originalWidth: number, isInline: boolean) {
	const targetWidth = isInline ? 100 : Math.min(originalWidth, 1200);
	return (targetWidth * originalHeight) / originalWidth;
}
