<script lang="ts">
	import type { PageData } from './$types';
	import SanityBlock from '$lib/components/sanity-block.svelte';
	import CoverImage from '$lib/components/cover-image.svelte';
	import { formatDate } from '$lib/utils';

	let { data }: { data: PageData } = $props();

	const { blog, meta } = data;

	const publishedDate = blog.publishedAt ? new Date(blog.publishedAt) : new Date(blog._createdAt);
	const formattedDate = formatDate ? formatDate(publishedDate) : publishedDate.toLocaleDateString();
</script>

<svelte:head>
	<title>{meta.title || blog.title || 'Blog Post'}</title>
	<meta name="description" content={meta.description || ''} />
	<meta property="og:title" content={meta.title || blog.title || ''} />
	<meta property="og:description" content={meta.description || ''} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={meta.url || ''} />
	{#if meta.publishedAt}
		<meta property="article:published_time" content={meta.publishedAt} />
	{/if}
	{#if meta.author}
		<meta property="article:author" content={meta.author} />
	{/if}
	{#if meta.tags}
		{#each meta.tags as tag}
			<meta property="article:tag" content={tag} />
		{/each}
	{/if}
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={meta.title || blog.title || ''} />
	<meta name="twitter:description" content={meta.description || ''} />
</svelte:head>

<main class="container mx-auto flex min-h-screen max-w-3xl flex-col gap-4 p-8 md:max-w-4xl">
	<article>
		{#if blog.image?.asset}
			<div class="-mx-8 mb-8 md:mx-0">
				<CoverImage
					image={blog.image}
					alt={blog.image.alt || blog.title || 'Blog cover image'}
					width={1200}
					height={600}
					class="h-64 w-full object-cover md:h-96 md:rounded-lg"
				/>
			</div>
		{/if}

		<header class="mb-8">
			<h1 class="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl">
				{blog.title}
			</h1>

			<div
				class="mb-6 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4"
			>
				{#if blog.author}
					<span>By {blog.author}</span>
				{/if}
				<span>{formattedDate}</span>
			</div>

			{#if blog.tags && blog.tags.length > 0}
				<div class="mb-6 flex flex-wrap gap-2">
					{#each blog.tags as tag}
						<span
							class="inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
						>
							{tag}
						</span>
					{/each}
				</div>
			{/if}
		</header>

		{#if blog.body}
			<div class="prose prose-lg max-w-none">
				<SanityBlock body={blog.body} />
			</div>
		{/if}
	</article>
</main>
