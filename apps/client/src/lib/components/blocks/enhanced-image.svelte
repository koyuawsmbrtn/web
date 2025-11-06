<script lang="ts">
	import { generateImageUrl } from '$lib/helper/image-url';

	interface EnhancedImageProps {
		portableText: any;
	}

	let { portableText }: EnhancedImageProps = $props();
	const { value } = portableText;

	console.log('=== ENHANCED IMAGE DEBUG ===');
	console.log('portableText:', portableText);
	console.log('value:', value);

	const imageUrl = $derived(
		value?.asset?._ref ? generateImageUrl(value, 800, 450) : null
	);

	$effect(() => {
		console.log('Generated imageUrl:', imageUrl);
	});
</script>

{#if imageUrl}
	<figure class="relative w-full my-8">
		<img
			src={imageUrl}
			alt={value.alt || ''}
			class="rounded-lg w-full"
			loading="lazy"
		/>
		{#if value.caption}
			<figcaption class="text-sm text-neutral-600 mt-2 text-center">
				{value.caption}
			</figcaption>
		{/if}
	</figure>
{/if}