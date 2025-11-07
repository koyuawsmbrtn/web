<script lang="ts">
	import type { PageData } from './$types';
	import SanityBlock from '$lib/components/sanity-block.svelte';
	import { generateImageUrl } from '$lib/helper/image-url';

	let { data }: { data: PageData } = $props();

	// Use the 'page' property to match the server load function
	const pageData = $derived(data?.page);
	const meta = $derived(data?.meta || {});
</script>

<svelte:head>
	<title>{meta.title || pageData?.title || 'Page'}</title>
	<meta name="description" content={meta.description || ''} />
	<meta property="og:title" content={meta.title || pageData?.title || ''} />
	<meta property="og:description" content={pageData?.description || ''} />
	<meta property="og:type" content="article" />
	{#if pageData.publishedAt}
		<meta property="article:published_time" content={pageData.publishedAt} />
	{/if}
	{#if pageData.tags}
		{#each pageData.tags as tag}
			<meta property="article:tag" content={tag} />
		{/each}
	{/if}
	<meta property="og:image" content={generateImageUrl(data.settings?.ogImage)} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={meta.title || pageData?.title || ''} />
	<meta name="twitter:description" content={pageData?.description || ''} />
</svelte:head>

<main class="container mx-auto min-h-screen max-w-3xl md:max-w-4xl p-8 flex flex-col gap-4">
	{#if pageData}
		{#if pageData.body}
			<div class="items-start mt-2 mb-8 text-left" style="max-width: 100%;">
				<SanityBlock content={pageData.body} />
			</div>
		{:else}
			<p class="text-neutral-600">No content available.</p>
		{/if}
	{:else}
		<div class="text-center py-12">
			<p class="text-neutral-600">Page not found.</p>
		</div>
	{/if}
</main>
