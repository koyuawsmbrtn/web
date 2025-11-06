import type { SanityImageDimensions } from '@sanity/asset-utils';

export type SimpleImage = {
	url: string;
	alt: string;
	dimensions: SanityImageDimensions;
};

export function getImageFromAsset(imageData: any): SimpleImage | null {
	if (!imageData?.asset) return null;
	
	if ('url' in imageData.asset) {
		return {
			url: imageData.asset.url,
			alt: imageData.alt || '',
			dimensions: imageData.asset.metadata?.dimensions || { width: 1920, height: 1080, aspectRatio: 1.78 }
		};
	}
	
	return null;
}
