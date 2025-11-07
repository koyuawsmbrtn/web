<script lang="ts">
	import { getImageDimensions } from '@sanity/asset-utils';
	import { client } from '$lib/sanity';
	import imageUrlBuilder from '@sanity/image-url';

	let { image, alt = '', width = 1200, height = 600, class: className = '', priority = false } = $props();

	const { projectId, dataset } = client.config();
	const builder = imageUrlBuilder({ projectId: projectId ?? '', dataset: dataset ?? '' });

	function generateCoverImageUrl(
		imageAsset: any,
		targetWidth: number,
		targetHeight: number
	): string {
		if (!imageAsset || !projectId || !dataset) {
			return '';
		}

		const imageRef = imageAsset.asset?._ref || imageAsset.asset?._id || imageAsset.asset;

		if (!imageRef) {
			return '';
		}

		try {
			const imageBuilder = builder
				.image(imageRef)
				.fit('crop')
				.crop('center')
				.width(targetWidth)
				.height(targetHeight)
				.format('webp')
				.quality(85) // Better performance with slightly lower quality
				.auto('format');

			return imageBuilder.url();
		} catch (error) {
			console.error('Error generating cover image URL:', error);
			return '';
		}
	}

	const imageUrl = $derived(generateCoverImageUrl(image, width, height));
	const dimensions = $derived(
		image?.asset ? getImageDimensions(image) : { width: width, height: height }
	);
</script>

{#if imageUrl}
	<img
		src={imageUrl}
		{alt}
		{width}
		{height}
		loading={priority ? 'eager' : 'lazy'}
		fetchpriority={priority ? 'high' : 'auto'}
		class="h-full w-full object-cover object-center {className}"
	/>
{/if}
