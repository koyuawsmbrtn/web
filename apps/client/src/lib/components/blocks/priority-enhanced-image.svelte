<script lang="ts">
	import { generateImageUrl } from '$lib/helper/image-url';

	interface EnhancedImageProps {
		portableText: any;
	}

	let { portableText }: EnhancedImageProps = $props();
	const { value } = portableText;

	const imageUrl = $derived(
		value?.asset?._ref ? generateImageUrl(value, 800, 450) : null
	);
</script>

{#if imageUrl}
	<figure class="relative w-full my-8">
		<img
			src={imageUrl}
			alt={value.alt || ''}
			class="rounded-lg w-full"
			loading="eager"
			fetchpriority="high"
		/>
		{#if value.caption}
			<figcaption class="text-sm text-neutral-600 mt-2 text-center">
				{value.caption}
			</figcaption>
		{/if}
	</figure>
{/if}
