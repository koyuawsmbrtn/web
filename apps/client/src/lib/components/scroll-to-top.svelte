<script lang="ts">
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	let isVisible = $state(false);
	
	const opacity = tweened(0, { duration: 300, easing: cubicOut });
	const scale = tweened(0, { duration: 300, easing: cubicOut });

	$effect(() => {
		if (isVisible) {
			opacity.set(1);
			scale.set(1);
		} else {
			opacity.set(0);
			scale.set(0);
		}
	});

	onMount(() => {
		const toggleVisibility = () => {
			if (window.pageYOffset > 100) {
				isVisible = true;
			} else {
				isVisible = false;
			}
		};

		window.addEventListener('scroll', toggleVisibility);
		return () => window.removeEventListener('scroll', toggleVisibility);
	});

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	};
</script>

{#if isVisible}
	<button
		onclick={scrollToTop}
		class="fixed bottom-8 right-8 p-3 rounded-full bg-neutral-900 text-white shadow-lg hover:bg-neutral-700 focus:outline-none cursor-pointer transition-colors z-50"
		style="opacity: {$opacity}; transform: scale({$scale})"
		aria-label="Scroll to top"
	>
		<!-- Arrow Up Icon -->
		<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
		</svg>
	</button>
{/if}