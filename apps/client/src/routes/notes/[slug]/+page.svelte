<script lang="ts">
	import SanityBlock from '$lib/components/sanity-block.svelte';
	import { generateImageUrl } from '$lib/helper/image-url';

	let { data }: { data: any } = $props();

	// Use the 'note' property to match the server load function
	const noteData = $derived(data?.note);
	const meta = $derived(data?.meta || {});
</script>

<svelte:head>
	<title>{meta.title || noteData?.title || 'Page'}</title>
	<meta name="description" content={meta.description || ''} />
	<meta property="og:title" content={meta.title || noteData?.title || ''} />
	<meta property="og:description" content={meta.description || ''} />
	<meta property="og:type" content="article" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={meta.title || noteData?.title || ''} />
	<meta name="twitter:description" content={meta.description || ''} />
	<meta property="og:image" content={generateImageUrl(data.settings?.ogImage)} />
</svelte:head>

<main class="container mx-auto flex min-h-screen max-w-3xl flex-col gap-4 p-8 md:min-w-[58vw]">
	{#if noteData}
		<h1 class="text-2xl font-bold sm:text-3xl md:text-4xl">
			{noteData.title}
		</h1>

		<div class="flex flex-col gap-6 md:flex-row">
			{#if noteData.body}
				<div class="flex-1 items-start text-left" style="max-width: 100%;">
					<SanityBlock content={noteData.body} />
				</div>
			{:else}
				<div class="flex-1">
					<p class="text-neutral-600">No content available.</p>
				</div>
			{/if}

			{#if noteData.image}
				<div class="shrink-0 md:ml-6 md:w-80">
					<img
						src={generateImageUrl(noteData.image, 400, 300)}
						alt={noteData.image.alt || noteData.title}
						class="rounded-lg shadow-md max-h-[300px]"
					/>
					{#if noteData.image.caption}
						<p class="mt-2 text-sm text-neutral-600">{noteData.image.caption}</p>
					{/if}
				</div>
			{/if}
		</div>
	{:else}
		<div class="py-12 text-center">
			<p class="text-neutral-600">Note not found.</p>
		</div>
	{/if}
</main>
