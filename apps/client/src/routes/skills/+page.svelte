<script lang="ts">
	import type { PageData } from './$types';
	import SkillCloud from '$lib/components/skill-cloud.svelte';
	import { onMount } from 'svelte';
	import { animate } from 'motion';

	let { data }: { data: PageData } = $props();

	const skills = $derived(data.skills || []);
	const title = $derived(data.title || 'Skills');

	let headerEl = $state<HTMLElement>(undefined!);
	let cloudEl = $state<HTMLElement>(undefined!);
	let hintEl = $state<HTMLElement>(undefined!);
	let hasPlayed = $state(false);

	const EASE: [number, number, number, number] = [0.4, 0.0, 0.2, 1.0];

	onMount(() => {
		hasPlayed = sessionStorage.getItem('skills-animation-played') === 'true';

		if (hasPlayed) return;

		if (headerEl) {
			animate(
				headerEl,
				{ opacity: [0, 1] },
				{ duration: 0.6, ease: EASE, delay: 0.1 }
			);
			headerEl.animate(
				[
					{ filter: 'blur(10px)', transform: 'translateY(14px)' },
					{ filter: 'blur(0px)', transform: 'translateY(0px)' }
				],
				{ duration: 600, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', delay: 100, fill: 'forwards' }
			);
		}

		if (cloudEl) {
			animate(
				cloudEl,
				{ opacity: [0, 1] },
				{ duration: 0.7, ease: EASE, delay: 0.3 }
			);
			cloudEl.animate(
				[
					{ filter: 'blur(8px)', transform: 'scale(0.97)' },
					{ filter: 'blur(0px)', transform: 'scale(1)' }
				],
				{ duration: 700, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', delay: 300, fill: 'forwards' }
			);
		}

		if (hintEl) {
			animate(
				hintEl,
				{ opacity: [0, 1] },
				{ duration: 0.5, ease: EASE, delay: 0.7 }
			);
			hintEl.animate(
				[
					{ filter: 'blur(6px)', transform: 'translateY(6px)' },
					{ filter: 'blur(0px)', transform: 'translateY(0px)' }
				],
				{ duration: 500, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', delay: 700, fill: 'forwards' }
			);
		}

		sessionStorage.setItem('skills-animation-played', 'true');
	});

	// Category legend
	const categories = $derived.by(() => {
		const cats = new Map<string, number>();
		for (const s of skills) {
			const cat = s.category || 'Other';
			cats.set(cat, (cats.get(cat) || 0) + 1);
		}
		return Array.from(cats.entries()).sort((a, b) => b[1] - a[1]);
	});

	function getCategoryDotColor(category: string): string {
		const key = category.toLowerCase();
		const colors: Record<string, string> = {
			languages: 'var(--accent-color, #c8c8c8)',
			frameworks: 'oklch(0.75 0.12 290)',
			devops: 'oklch(0.72 0.14 155)',
			tools: 'oklch(0.72 0.12 230)'
		};
		return colors[key] ?? 'oklch(0.7 0.02 250)';
	}
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="robots" content="noindex, nofollow" />
	<meta name="description" content="An interactive skill cloud — drag and flick to explore." />
</svelte:head>

<section class="skills-page">
	<div class="skills-inner">
		<header
			bind:this={headerEl}
			class="skills-header"
			style={hasPlayed ? '' : 'opacity: 0; filter: blur(10px); transform: translateY(14px);'}
		>
			<span class="skills-label">Interactive</span>
			<h1 class="skills-title">{title}</h1>
			<p class="skills-subtitle">
				A cloud of technologies, languages, and tools I work with.
			</p>
		</header>

		<div
			bind:this={cloudEl}
			class="skills-cloud-wrapper"
			style={hasPlayed ? '' : 'opacity: 0; filter: blur(8px); transform: scale(0.97);'}
		>
			<SkillCloud skills={skills} isLoading={skills.length === 0} />
		</div>
</section>

<style>
	.skills-page {
		position: relative;
		overflow: hidden;
		padding: 3rem 0 4rem;
	}

	.skills-inner {
		max-width: 56rem;
		margin: 0 auto;
		padding: 0 2rem;
	}

	.skills-header {
		margin-bottom: 2rem;
	}

	.skills-label {
		display: inline-block;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--accent-color, oklch(0.6 0.15 250));
		margin-bottom: 0.75rem;
	}

	.skills-title {
		font-size: 2rem;
		font-weight: 700;
		color: oklch(0.985 0 0);
		letter-spacing: -0.02em;
		line-height: 1.2;
		margin: 0 0 0.5rem;
	}

	.skills-subtitle {
		font-size: 1rem;
		color: oklch(0.55 0 0);
		line-height: 1.6;
		margin: 0;
		max-width: 32rem;
	}

	.skills-cloud-wrapper {
		margin-bottom: 1.5rem;
	}

	@media (max-width: 640px) {
		.skills-inner {
			padding: 0 1rem;
		}

		.skills-title {
			font-size: 1.5rem;
		}
	}
</style>
