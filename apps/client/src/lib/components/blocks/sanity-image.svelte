<script lang="ts">
	import { getImageDimensions } from '@sanity/asset-utils';
	import { generateImageUrl, dynamicHeight } from '$lib/helper/image-url';

	let { portableText } = $props();
	const { value, isInline } = portableText;
</script>

{#if value?.asset}
	{@const image = value}
	{@const dimensions = getImageDimensions(image)}
	{@const calculatedHeight = dynamicHeight(dimensions.height, dimensions.width, isInline ?? false)}
	{@const imageUrl = generateImageUrl(image, dimensions.width, dimensions.height)}
	
	<img
		src={imageUrl}
		alt={image.alt || ''}
		width={isInline ? 100 : Math.min(dimensions.width, 1200)}
		height={calculatedHeight}
		loading="lazy"
		class={isInline ? 'inline-block' : 'block mx-auto my-4'}
	/>
{/if}
