<script lang="ts">
	import type { PageData } from './$types';
	import SanityBlock from '$lib/components/sanity-block.svelte';
	import { generateImageUrl } from '$lib/helper/image-url';
	import Name from '$lib/components/name.svelte';
	import TypedTagline from '$lib/components/typed-tagline.svelte';
	import SocialLinks from '$lib/components/social-links.svelte';
	import NowListening from '$lib/components/now-listening.svelte';
	import Avatars from '$lib/components/avatars.svelte';
	import LatestPosts from '$lib/components/latest-posts.svelte';
	import Cta from '$lib/components/cta.svelte';
	import { onMount } from 'svelte';
	import { animate } from 'motion';

	let { data }: { data: PageData } = $props();

	const pageData = $derived(data?.page);
	const meta = $derived(data?.meta || {});

	let heroEl = $state<HTMLElement>(undefined!);
	let friendsHeadingEl = $state<HTMLElement>(undefined!);
	let blogHeadingEl = $state<HTMLElement>(undefined!);
	let divider1El = $state<HTMLElement>(undefined!);
	let divider2El = $state<HTMLElement>(undefined!);
	let hasPlayed = $state(false);

	const EASE: [number, number, number, number] = [0.4, 0.0, 0.2, 1.0];

	function fadeInOnScroll(el: HTMLElement | null, delay = 0) {
		if (!el) return;
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;
					animate(
						el,
						{ opacity: [0, 1] },
						{
							duration: 0.6,
							ease: EASE,
							delay,
						}
					);
					el.animate(
						[
							{ filter: 'blur(8px)', transform: 'translateY(10px)' },
							{ filter: 'blur(0px)', transform: 'translateY(0px)' },
						],
						{
							duration: 600,
							easing: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
							delay: delay * 1000,
							fill: 'forwards',
						}
					);
					observer.unobserve(el);
				});
			},
			{ threshold: 0.1 }
		);
		observer.observe(el);
	}

	onMount(() => {
		hasPlayed = sessionStorage.getItem('page-animation-played') === 'true';

		if (hasPlayed) return;

		if (heroEl) {
			animate(
				heroEl,
				{ opacity: [0, 1] },
				{
					duration: 0.8,
					ease: EASE,
					delay: 0.15,
				}
			);
			heroEl.animate(
				[
					{ filter: 'blur(8px)', transform: 'translateY(12px)' },
					{ filter: 'blur(0px)', transform: 'translateY(0px)' },
				],
				{
					duration: 800,
					easing: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
					delay: 150,
					fill: 'forwards',
				}
			);
		}

		fadeInOnScroll(divider1El, 0);
		fadeInOnScroll(friendsHeadingEl, 0.1);
		fadeInOnScroll(divider2El, 0);
		fadeInOnScroll(blogHeadingEl, 0.1);

		sessionStorage.setItem('page-animation-played', 'true');
	});
</script>

<svelte:head>
	<title>{meta.title || pageData?.title || 'Page'}</title>
	<meta name="description" content={meta.description || ''} />
	<meta property="og:title" content={meta.title || pageData?.title || ''} />
	<meta property="og:description" content={pageData?.description || ''} />
	<meta property="og:type" content="article" />
	{#if pageData?.publishedAt}
		<meta property="article:published_time" content={pageData.publishedAt} />
	{/if}
	{#if pageData?.tags}
		{#each pageData.tags as tag}
			<meta property="article:tag" content={tag} />
		{/each}
	{/if}
	<meta property="og:image" content={generateImageUrl(data.settings?.ogImage)} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={meta.title || pageData?.title || ''} />
	<meta name="twitter:description" content={pageData?.description || ''} />
	<link rel="me" href="https://koyu.social/@koyu" />
	<meta name="fediverse:creator" content="@koyu@koyu.social" />
</svelte:head>

{#if pageData}
	{#if pageData.body}
		<!-- Hero Section -->
		<section class="relative overflow-hidden">
			<div class="hero-glow"></div>
			<div class="hero-noise"></div>
			<div class="container mx-auto max-w-3xl md:max-w-4xl px-8 pt-16 pb-8 md:pt-24 md:pb-12 relative z-10">
				<div
					bind:this={heroEl}
					style={hasPlayed ? '' : 'opacity: 0; filter: blur(8px); transform: translateY(12px);'}
				>
					<Name />
					<TypedTagline />
					<SocialLinks />
				</div>
			</div>
		</section>

		<!-- Now Listening -->
		<section class="container mx-auto max-w-3xl md:max-w-4xl px-8 py-6">
			<NowListening />
		</section>

		<!-- Divider 1 -->
		<div class="container mx-auto max-w-3xl md:max-w-4xl px-8">
			<div
				bind:this={divider1El}
				class="section-divider"
				style={hasPlayed ? '' : 'opacity: 0;'}
			></div>
		</div>

		<!-- Friends Section -->
		<section class="container mx-auto max-w-3xl md:max-w-4xl px-8 py-12 md:py-16">
			<div
				bind:this={friendsHeadingEl}
				class="section-header"
				style={hasPlayed ? '' : 'opacity: 0; filter: blur(8px); transform: translateY(10px);'}
			>
				<span class="section-label">Community</span>
				<h2 class="section-title">My friends</h2>
				<p class="section-subtitle">Some of the amazing people I'm connected with around the web.</p>
			</div>
			<Avatars />
		</section>

		<!-- Divider 2 -->
		<div class="container mx-auto max-w-3xl md:max-w-4xl px-8">
			<div
				bind:this={divider2El}
				class="section-divider"
				style={hasPlayed ? '' : 'opacity: 0;'}
			></div>
		</div>

		<!-- Latest Blog Posts Section -->
		<section class="container mx-auto max-w-3xl md:max-w-4xl px-8 py-12 md:py-16">
			<div
				bind:this={blogHeadingEl}
				class="section-header"
				style={hasPlayed ? '' : 'opacity: 0; filter: blur(8px); transform: translateY(10px);'}
			>
				<span class="section-label">Blog</span>
				<h2 class="section-title">Latest posts</h2>
				<p class="section-subtitle">Thoughts, tutorials, and things I've been working on lately.</p>
			</div>
			<LatestPosts />
		</section>

		<!-- CTA Section -->
		<section class="container mx-auto max-w-3xl md:max-w-4xl px-8 pb-16 md:pb-24">
			<Cta />
		</section>
	{:else}
		<main class="container mx-auto min-h-screen max-w-3xl md:max-w-4xl p-8 flex flex-col items-center justify-center">
			<p class="text-neutral-600">No content available.</p>
		</main>
	{/if}
{:else}
	<main class="container mx-auto min-h-screen max-w-3xl md:max-w-4xl p-8 flex flex-col items-center justify-center">
		<div class="text-center py-12">
			<p class="text-neutral-600">Page not found.</p>
		</div>
	</main>
{/if}

<style>
	.hero-glow {
		position: absolute;
		top: -40%;
		left: 50%;
		transform: translateX(-50%);
		width: 60%;
		height: 100%;
		background: radial-gradient(
			ellipse at center,
			oklch(from var(--accent-color, #3b82f6) l c h / 6%) 0%,
			transparent 70%
		);
		pointer-events: none;
		z-index: 0;
	}

	.hero-noise {
		position: absolute;
		inset: 0;
		z-index: 1;
		pointer-events: none;
		opacity: 0.035;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
		background-repeat: repeat;
		background-size: 128px 128px;
	}

	.section-divider {
		height: 1px;
		background: linear-gradient(
			to right,
			transparent 0%,
			oklch(1 0 0 / 8%) 20%,
			oklch(1 0 0 / 12%) 50%,
			oklch(1 0 0 / 8%) 80%,
			transparent 100%
		);
	}

	.section-header {
		margin-bottom: 2.5rem;
	}

	.section-label {
		display: inline-block;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--accent-color, oklch(0.6 0.15 250));
		margin-bottom: 0.75rem;
	}

	.section-title {
		font-size: 1.75rem;
		font-weight: 700;
		color: oklch(0.985 0 0);
		letter-spacing: -0.02em;
		line-height: 1.2;
		margin-bottom: 0.5rem;
	}

	.section-subtitle {
		font-size: 1rem;
		color: oklch(0.55 0 0);
		line-height: 1.6;
		max-width: 32rem;
	}
</style>
