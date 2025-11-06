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
	<meta property="og:description" content={meta.description || ''} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={meta.url || ''} />
	{#if meta.publishedAt}
		<meta property="article:published_time" content={meta.publishedAt} />
	{/if}
	{#if meta.tags}
		{#each meta.tags as tag}
			<meta property="article:tag" content={tag} />
		{/each}
	{/if}
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={meta.title || pageData?.title || ''} />
	<meta name="twitter:description" content={meta.description || ''} />
</svelte:head>

<main class="container mx-auto flex min-h-screen max-w-3xl flex-col gap-4 p-8 md:min-w-[58vw]">
	{#if pageData}
		<h1 class="text-2xl font-bold sm:text-3xl md:text-4xl">
			{pageData.title}
		</h1>

		<div class="flex flex-col gap-6 md:flex-row">
			{#if pageData.body}
				<div class="flex-1 items-start text-left" style="max-width: 100%;">
					<SanityBlock content={pageData.body} />
				</div>
			{:else}
				<div class="flex-1">
					<p class="text-neutral-600">No content available.</p>
				</div>
			{/if}

			{#if pageData.image}
				<div class="flex-shrink-0 md:ml-6 md:w-80">
					<img
						src={generateImageUrl(pageData.image, 400, 300)}
						alt={pageData.image.alt || pageData.title}
						class="rounded-lg shadow-md max-h-[300px]"
					/>
					{#if pageData.image.caption}
						<p class="mt-2 text-sm text-neutral-600">{pageData.image.caption}</p>
					{/if}
				</div>
			{/if}
		</div>
	{:else}
		<div class="py-12 text-center">
			<p class="text-neutral-600">Page not found.</p>
		</div>
	{/if}
</main>
