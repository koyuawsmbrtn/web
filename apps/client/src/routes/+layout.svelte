<script lang="ts">
	import { VisualEditing } from '@sanity/visual-editing/svelte';
	import { LiveMode } from '@sanity/svelte-loader';
	import { client } from '$lib/sanity';
	import Footer from '$lib/components/footer.svelte';
	import '../app.css';
	import Navbar from '$lib/components/animated-navbar.svelte';
	import ScrollToTop from '$lib/components/scroll-to-top.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { generateImageUrl } from '$lib/helper/image-url';

	let { children, data } = $props();
	
	// Use server-loaded accent color instead of client-side fetch
	const accentColor = $derived(data.accentColor || '#000000');
</script>

<svelte:head>
	<title>{data.settings?.title || 'Website'}</title>
	<meta name="description" content={data.settings?.description || ''} />
	<meta property="og:title" content={data.settings?.longTitle || data.settings?.title || ''} />
	<meta property="og:description" content={data.settings?.description || ''} />
	<meta property="og:image" content={generateImageUrl(data.settings?.ogImage)} />
	<meta name="twitter:title" content={data.settings?.longTitle || data.settings?.title || ''} />
	<meta name="twitter:description" content={data.settings?.description || ''} />
	<meta name="robots" content="index, follow" />
	{#if data.logo}
		<link rel="icon" href={generateImageUrl(data.settings.favicon)} />
		<link rel="apple-touch-icon" href={data.logo.url} />
		<!-- Preload logo for faster LCP -->
		<link rel="preload" as="image" href={data.logo.url} fetchpriority="high" />
	{/if}
	<link rel="manifest" href="/manifest.webmanifest" />
</svelte:head>

<div class="scroll-smooth font-sans antialiased" style="--accent-color: {accentColor}">
	<Navbar settings={data.settings} navigationItems={data.navigation} />
	<main
		id="main-content"
		tabindex="-1"
		class="min-h-[calc(100vh-11.3rem)] focus:outline-none md:min-h-[calc(100vh-9.05rem)]"
	>
		<Toaster />
		{@render children()}
	</main>
	<ScrollToTop />
	{#if data.settings}
		<Footer settings={data.settings} />
	{/if}
	{#if data.preview}
		<VisualEditing />
		<LiveMode {client} />
	{/if}
</div>

<style>
	/* Link styling only for content inside sanity-block */
	:global(.sanity-block a) {
		color: var(--accent-color, #000);
		text-decoration: none;
		transition: text-decoration 0.2s ease;
	}

	:global(.sanity-block a:hover) {
		text-decoration: underline;
	}

	/* SVG styling inside links within sanity-block */
	:global(.sanity-block a svg) {
		stroke: var(--accent-color, #000);
		transition:
			stroke 0.2s ease,
			fill 0.2s ease;
		margin-left: -16px;
	}

	:global(input::placeholder),
	:global(textarea::placeholder) {
		color: var(--color-muted-foreground);
		opacity: 0.7;
	}

	:global(input),
	:global(textarea) {
		background-color: #171717;
		color: #ffffff;
		border-radius: 0.5rem;
		border: 1px solid var(--color-neutral-800);
		padding: 0.75rem 1rem;
		margin-top: 0.5rem;
		margin-bottom: 1rem;
		outline: none;
		transition: all 0.2s ease;
		font-size: 0.875rem;
		display: block;
		box-sizing: border-box;
	}

	:global(input::placeholder),
	:global(textarea::placeholder) {
		color: var(--color-muted-foreground);
		opacity: 0.7;
	}

	:global(input:focus),
	:global(textarea:focus) {
		outline: none;
		border-color: var(--accent-color, var(--color-primary));
		box-shadow: 0 0 0 2px rgb(from var(--accent-color, var(--color-primary)) r g b / 0.2);
	}

	:global(input:hover),
	:global(textarea:hover) {
		border-color: var(--color-muted-foreground);
	}

	:global(.sanity-block button) {
		background-color: var(--accent-color, var(--color-primary));
		color: #000;
		border: none;
		border-radius: 2rem;
		padding: 0.75rem 1.5rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.875rem;
	}

	:global(button:hover) {
		opacity: 0.9;
	}

	:global(button:active) {
		opacity: 0.8;
	}

	:global(button:disabled) {
		opacity: 0.5;
		cursor: not-allowed;
	}

	:global(textarea) {
		min-height: 8rem;
		resize: vertical;
		font-family: inherit;
		line-height: 1.5;
	}

	:global(label:not(.inline)) {
		display: block;
		margin-bottom: 0.25rem;
		font-weight: 500;
		font-size: 0.875rem;
	}

	:global(label input),
	:global(label textarea) {
		margin-top: 0.25rem;
	}

	:global(.border-primary) {
		border-color: var(--accent-color, var(--color-primary));
	}
</style>
