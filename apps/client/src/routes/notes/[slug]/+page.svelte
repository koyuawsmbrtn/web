<script lang="ts">
	import SanityBlock from '$lib/components/sanity-block.svelte';
	import { generateImageUrl } from '$lib/helper/image-url';
	import { formatDate } from '$lib/utils';
	import { onMount } from 'svelte';
	import { animate } from 'motion';

	let { data }: { data: any } = $props();

	const noteData = $derived(data?.note);
	const meta = $derived(data?.meta || {});

	const publishedDate = $derived(
		noteData?.publishedAt
			? new Date(noteData.publishedAt)
			: noteData?._createdAt
				? new Date(noteData._createdAt)
				: null
	);

	const updatedDate = $derived(
		noteData?._updatedAt ? new Date(noteData._updatedAt) : null
	);

	const showUpdated = $derived(
		updatedDate && publishedDate && updatedDate.getTime() - publishedDate.getTime() > 86400000
	);

	let articleEl = $state<HTMLElement>(undefined!);
	let hasPlayed = $state(false);

	const SESSION_KEY = 'note-animation-played';

	onMount(() => {
		hasPlayed = sessionStorage.getItem(SESSION_KEY) === 'true';

		if (hasPlayed || !articleEl) return;

		animate(
			articleEl,
			{ opacity: [0, 1] },
			{
				duration: 0.6,
				ease: [0.4, 0.0, 0.2, 1.0] as [number, number, number, number],
				delay: 0.1
			}
		);

		articleEl.animate(
			[
				{ filter: 'blur(8px)', transform: 'translateY(12px)' },
				{ filter: 'blur(0px)', transform: 'translateY(0px)' }
			],
			{
				duration: 600,
				easing: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
				delay: 100,
				fill: 'forwards'
			}
		);

		sessionStorage.setItem(SESSION_KEY, 'true');
	});
</script>

<svelte:head>
	<title>{meta.title || noteData?.title || 'Note'}</title>
	<meta name="description" content={meta.description || ''} />
	<meta property="og:title" content={meta.title || noteData?.title || ''} />
	<meta property="og:description" content={meta.description || ''} />
	<meta property="og:type" content="article" />
	{#if meta.publishedAt}
		<meta property="article:published_time" content={meta.publishedAt} />
	{/if}
	{#if meta.tags}
		{#each meta.tags as tag}
			<meta property="article:tag" content={tag} />
		{/each}
	{/if}
	<meta property="og:image" content={generateImageUrl(data.settings?.ogImage)} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={meta.title || noteData?.title || ''} />
	<meta name="twitter:description" content={meta.description || ''} />
	<link rel="me" href="https://koyu.social/@koyu" />
	<meta name="fediverse:creator" content="@koyu@koyu.social" />
</svelte:head>

{#if noteData}
	<article
		class="note-page"
		bind:this={articleEl}
		style={hasPlayed ? '' : 'opacity: 0; filter: blur(8px); transform: translateY(12px);'}
	>
		<!-- Back link -->
		<div class="container mx-auto max-w-3xl md:max-w-4xl px-8 pt-8 md:pt-12">
			<a href="/notes" class="back-link">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
				Back
			</a>
		</div>

		<!-- Cover image -->
		{#if noteData.image?.asset}
			<div class="container mx-auto max-w-3xl md:max-w-4xl px-8 pt-6">
				<div class="cover-image-wrapper">
					<img
						src={generateImageUrl(noteData.image, 1200, 600)}
						alt={noteData.image.alt || noteData.title || 'Note cover image'}
						class="cover-image"
					/>
					{#if noteData.image.caption}
						<p class="image-caption">{noteData.image.caption}</p>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Header -->
		<header class="container mx-auto max-w-3xl md:max-w-4xl px-8 pt-8 md:pt-12">
			{#if noteData.tags && noteData.tags.length > 0}
				<div class="note-tags">
					{#each noteData.tags as tag}
						<span class="tag-pill">{tag}</span>
					{/each}
				</div>
			{/if}

			<h1 class="note-title">{noteData.title}</h1>

			{#if publishedDate}
				<div class="note-meta">
					<time datetime={publishedDate.toISOString()}>
						{formatDate(publishedDate)}
					</time>
					{#if showUpdated && updatedDate}
						<span class="meta-separator">·</span>
						<span class="updated-label">
							Updated {formatDate(updatedDate)}
						</span>
					{/if}
				</div>
			{/if}

			<div class="header-divider"></div>
		</header>

		<!-- Body -->
		<div class="container mx-auto max-w-3xl md:max-w-4xl px-8 pb-16 md:pb-24">
			{#if noteData.body}
				<div class="note-body sanity-block">
					<SanityBlock body={noteData.body} />
				</div>
			{:else}
				<div class="empty-state">
					<p>This note doesn't have any content yet.</p>
				</div>
			{/if}
		</div>
	</article>
{:else}
	<main class="container mx-auto min-h-screen max-w-3xl md:max-w-4xl px-8 flex flex-col items-center justify-center">
		<div class="empty-state">
			<div class="empty-icon">📝</div>
			<p>Note not found.</p>
			<a href="/" class="back-link back-link-centered">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
				Go home
			</a>
		</div>
	</main>
{/if}

<style>
	.note-page {
		min-height: calc(100vh - 11.3rem);
	}

	/* Back link */
	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.85rem;
		font-weight: 500;
		color: oklch(0.55 0 0);
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.back-link:hover {
		color: var(--accent-color, oklch(0.75 0 0));
	}

	.back-link-centered {
		margin-top: 1.5rem;
	}

	/* Cover image */
	.cover-image-wrapper {
		overflow: hidden;
		border-radius: 1rem;
		border: 1px solid oklch(1 0 0 / 6%);
	}

	.cover-image {
		width: 100%;
		max-height: 24rem;
		object-fit: cover;
		display: block;
	}

	.image-caption {
		padding: 0.75rem 1rem;
		font-size: 0.8rem;
		color: oklch(0.5 0 0);
		text-align: center;
		border-top: 1px solid oklch(1 0 0 / 6%);
		background: oklch(0.15 0 0 / 40%);
	}

	/* Tags */
	.note-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		margin-bottom: 1rem;
	}

	.tag-pill {
		display: inline-block;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.25rem 0.625rem;
		border-radius: 9999px;
		background: oklch(1 0 0 / 5%);
		color: var(--accent-color, oklch(0.65 0 0));
		border: 1px solid oklch(1 0 0 / 8%);
	}

	/* Title */
	.note-title {
		font-size: 2rem;
		font-weight: 700;
		color: oklch(0.985 0 0);
		letter-spacing: -0.025em;
		line-height: 1.2;
		margin: 0;
	}

	@media (min-width: 640px) {
		.note-title {
			font-size: 2.5rem;
		}
	}

	@media (min-width: 768px) {
		.note-title {
			font-size: 3rem;
		}
	}

	/* Meta info */
	.note-meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 1rem;
		font-size: 0.85rem;
		color: oklch(0.5 0 0);
	}

	.meta-separator {
		color: oklch(0.35 0 0);
	}

	.updated-label {
		color: oklch(0.45 0 0);
	}

	/* Divider */
	.header-divider {
		margin-top: 2rem;
		margin-bottom: 2.5rem;
		height: 1px;
		background: linear-gradient(
			to right,
			transparent 0%,
			oklch(1 0 0 / 10%) 20%,
			oklch(1 0 0 / 14%) 50%,
			oklch(1 0 0 / 10%) 80%,
			transparent 100%
		);
	}

	/* Body */
	.note-body {
		font-size: 1.05rem;
		line-height: 1.8;
		color: oklch(0.82 0 0);
	}

	.note-body :global(h1),
	.note-body :global(h2),
	.note-body :global(h3),
	.note-body :global(h4) {
		color: oklch(0.95 0 0);
		margin-top: 2rem;
		margin-bottom: 0.75rem;
	}

	.note-body :global(h1) {
		font-size: 1.75rem;
		font-weight: 700;
	}

	.note-body :global(h2) {
		font-size: 1.5rem;
		font-weight: 700;
	}

	.note-body :global(h3) {
		font-size: 1.25rem;
		font-weight: 600;
	}

	.note-body :global(p) {
		margin-bottom: 1.25rem;
	}

	.note-body :global(img) {
		border-radius: 0.75rem;
		margin-top: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.note-body :global(blockquote) {
		border-left: 3px solid var(--accent-color, oklch(0.5 0 0));
		padding-left: 1.25rem;
		margin: 1.5rem 0;
		color: oklch(0.65 0 0);
		font-style: italic;
	}

	.note-body :global(code) {
		background: oklch(0.2 0 0 / 80%);
		padding: 0.15rem 0.4rem;
		border-radius: 0.3rem;
		font-size: 0.9em;
		color: oklch(0.8 0 0);
	}

	.note-body :global(pre) {
		background: oklch(0.13 0 0 / 90%);
		border: 1px solid oklch(1 0 0 / 8%);
		border-radius: 0.75rem;
		padding: 1.25rem;
		overflow-x: auto;
		margin: 1.5rem 0;
	}

	.note-body :global(pre code) {
		background: none;
		padding: 0;
		border-radius: 0;
	}

	.note-body :global(ul),
	.note-body :global(ol) {
		margin-bottom: 1.25rem;
		padding-left: 1.5rem;
	}

	.note-body :global(li) {
		margin-bottom: 0.375rem;
	}

	.note-body :global(hr) {
		border: none;
		height: 1px;
		background: linear-gradient(
			to right,
			transparent 0%,
			oklch(1 0 0 / 10%) 30%,
			oklch(1 0 0 / 10%) 70%,
			transparent 100%
		);
		margin: 2.5rem 0;
	}

	.note-body :global(a) {
		color: var(--accent-color, oklch(0.7 0.12 250));
		text-decoration: underline;
		text-underline-offset: 2px;
		text-decoration-color: oklch(from var(--accent-color, oklch(0.7 0.12 250)) l c h / 30%);
		transition: text-decoration-color 0.2s ease;
	}

	.note-body :global(a:hover) {
		text-decoration-color: var(--accent-color, oklch(0.7 0.12 250));
	}

	/* Empty state */
	.empty-state {
		text-align: center;
		padding: 3rem 0;
		color: oklch(0.5 0 0);
		font-size: 1rem;
	}

	.empty-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}
</style>
