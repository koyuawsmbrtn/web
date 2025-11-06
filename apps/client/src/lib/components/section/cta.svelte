<script lang="ts">
	import LinkButton from '../link-button.svelte';
	import type { CtaSection } from '$lib/sanity.types';
	import { deconstructLink } from '$lib/helper/link';
	import type { SimpleImage } from '$lib/helper/asset-to-url';
	import { cn } from '$lib/utils';
	import SanityBlock from '../sanity-block.svelte';
	import { onMount } from 'svelte';

	interface CTAProps {
		cta?: CtaSection;
		sectionTitle?: string;
		background: SimpleImage | any;
		backgroundColor?: string;
		textColor?: string;
	}

	let {
		cta,
		background,
		sectionTitle,
		backgroundColor = 'bg-gray-900/80',
		textColor = 'text-white'
	}: CTAProps = $props();

	let linkData: { href: string; target: string } | null = $state(null);
	let mounted = $state(false);

	onMount(async () => {
		if (cta?.button?.link) {
			linkData = await deconstructLink(cta.button.link);
		}
		mounted = true;
	});

</script>

<section
	class={cn(
		'flex flex-col md:flex-row w-full',
		textColor
	)}
	style:background-image={background?.url ? `url(${background.url})` : undefined}
	style:background-size="cover"
	style:background-position="center"
	style:background-repeat="no-repeat"
	aria-label={background?.alt}
>
<div class={cn('absolute inset-0 z-[-1]', backgroundColor)}></div>

<div
class="z-10 flex flex-col items-center md:items-start justify-center md:justify-start mt-20 px-6 md:px-20 md:py-32 md:flex-1 space-y-12"
>
<div>
	{#if sectionTitle}
	<p class="text-sm mb-4">
		{sectionTitle}
	</p>
	{/if}
	<h1 class="md:max-w-[60rem] text-6xl md:text-8xl font-bold leading-tight">
		{cta?.title}
	</h1>
</div>

<div class="flex flex-col items-start space-y-8 md:space-y-14 w-full max-w-xl">
	{#if cta?.description}
	<div class="text-lg">
		<SanityBlock body={cta.description} />
	</div>
	{/if}
	{#if mounted && linkData}
				<div class="mb-20">
					<LinkButton
						text={cta?.button?.text ?? ''}
						{linkData}
						size="lg"
						variant="default"
					/>
				</div>
			{/if}
		</div>
	</div>
</section>
