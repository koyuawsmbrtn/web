<script lang="ts">
	import { onMount } from 'svelte';
	import { animate } from 'motion';
	import { ArrowRight } from '@lucide/svelte';

	let ctaEl: HTMLElement;
	let hasPlayed = $state(false);

	onMount(() => {
		hasPlayed = sessionStorage.getItem('cta-animation-played') === 'true';

		if (hasPlayed || !ctaEl) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;

					animate(
						ctaEl,
						{ opacity: [0, 1] },
						{
							duration: 0.6,
							ease: [0.4, 0.0, 0.2, 1.0] as [number, number, number, number],
						}
					);

					ctaEl.animate(
						[
							{ filter: 'blur(12px)', transform: 'translateY(16px)' },
							{ filter: 'blur(0px)', transform: 'translateY(0px)' },
						],
						{
							duration: 600,
							easing: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
							fill: 'forwards',
						}
					);

					sessionStorage.setItem('cta-animation-played', 'true');
					observer.unobserve(ctaEl);
				});
			},
			{ threshold: 0.15 }
		);

		observer.observe(ctaEl);
	});
</script>

<div
	bind:this={ctaEl}
	class="cta-container"
	style={hasPlayed ? '' : 'opacity: 0; filter: blur(12px); transform: translateY(16px);'}
>
	<div class="cta-inner">
		<h2 class="cta-heading">Wanna work with me?</h2>
		<p class="cta-description">
			I'm always open to new projects, collaborations, and interesting ideas. Let's build something great together.
		</p>
		<a href="/contact" class="cta-button group">
			<span>Get in touch</span>
			<ArrowRight size={20} strokeWidth={2.5} class="transition-transform duration-300 group-hover:translate-x-1" />
		</a>
	</div>
</div>

<style>
	.cta-container {
		width: 100%;
		margin-top: 4rem;
		margin-bottom: 2rem;
	}

	.cta-inner {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 1.25rem;
		padding: 3rem 2rem;
		border-radius: 1.5rem;
		border: 1px solid oklch(1 0 0 / 8%);
		background: linear-gradient(
			145deg,
			oklch(0.205 0 0 / 60%) 0%,
			oklch(0.17 0 0 / 40%) 100%
		);
		backdrop-filter: blur(8px);
	}

	.cta-heading {
		font-size: 1.75rem;
		font-weight: 700;
		color: oklch(0.985 0 0);
		letter-spacing: -0.02em;
		line-height: 1.2;
	}

	.cta-description {
		font-size: 1rem;
		color: oklch(0.708 0 0);
		max-width: 28rem;
		line-height: 1.6;
	}

	.cta-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.5rem;
		padding: 0.75rem 1.75rem;
		border-radius: 9999px;
		font-weight: 600;
		font-size: 0.9rem;
		color: oklch(0.145 0 0);
		background-color: var(--accent-color, oklch(0.922 0 0));
		transition: all 0.2s ease;
		text-decoration: none;
	}

	.cta-button:hover {
		opacity: 0.9;
		transform: translateY(-1px);
		box-shadow: 0 4px 20px oklch(0 0 0 / 30%);
	}

	.cta-button:active {
		transform: translateY(0px);
		opacity: 0.8;
	}
</style>
