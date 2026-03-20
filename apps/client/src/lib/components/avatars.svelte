<script lang="ts">
	import { onMount } from 'svelte';
	import { client } from '$lib/sanity';
	import { generateImageUrl } from '$lib/helper/image-url';
	import { animate } from 'motion';

	interface Avatar {
		_id: string;
		name: string;
		link: string;
		image: {
			asset: {
				_ref: string;
			};
		};
	}

	let avatars = $state<Avatar[]>([]);
	let error = $state<string | null>(null);
	let isLoading = $state(true);
	let gridEl = $state<HTMLElement>(undefined!);

	const STAGGER_DELAY = 0.08;

	function animateAvatars() {
		if (!gridEl) return;

		const items = gridEl.querySelectorAll<HTMLElement>('.avatar-item');

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;

					const el = entry.target as HTMLElement;
					const index = Number(el.dataset.index || 0);
					const delay = index * STAGGER_DELAY;

					animate(
						el,
						{ opacity: [0, 1] },
						{
							duration: 0.5,
							ease: [0.4, 0.0, 0.2, 1.0] as [number, number, number, number],
							delay,
						}
					);

					el.animate(
						[
							{ filter: 'blur(12px)', transform: 'translateY(8px)' },
							{ filter: 'blur(0px)', transform: 'translateY(0px)' },
						],
						{
							duration: 500,
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

		items.forEach((item) => observer.observe(item));
	}

	onMount(async () => {
		try {
			const data = await client.fetch<Avatar[]>(`
				*[_type == "avatar"] {
					_id,
					name,
					link,
					image
				}
			`);
			avatars = data;
		} catch (err) {
			console.error('Error fetching avatars:', err);
			error = 'Failed to load avatars';
		} finally {
			isLoading = false;
		}
	});

	$effect(() => {
		if (!isLoading && avatars.length > 0) {
			requestAnimationFrame(() => {
				animateAvatars();
			});
		}
	});
</script>

{#if error}
	<div class="text-red-400">{error}</div>
{:else if isLoading}
	<div>
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
				{#each Array(8) as _, index}
					<div class="group">
						<div class="aspect-square overflow-hidden rounded-full border border-neutral-700 transition-all duration-300">
							<div class="w-full h-full bg-neutral-700 animate-pulse" aria-label="Loading avatar {index + 1}"></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
{:else}
	<div>
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6" bind:this={gridEl}>
				{#each avatars as avatar, i (avatar._id)}
					<a
						href={avatar.link}
						target="_blank"
						rel="noopener noreferrer"
						class="group avatar-item"
						data-index={i}
						style="opacity: 0; filter: blur(12px); transform: translateY(8px);"
					>
						<div class="aspect-square overflow-hidden rounded-full border border-neutral-700 transition-all duration-300 hover:border-neutral-500">
							<img
								src={generateImageUrl(avatar.image, 200, 200) || '/placeholder.png'}
								alt={avatar.name}
								class="w-full h-full object-cover bg-neutral-800"
								loading="lazy"
							/>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</div>
{/if}
