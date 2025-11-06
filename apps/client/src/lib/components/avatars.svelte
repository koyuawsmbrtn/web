<script lang="ts">
	import { onMount } from 'svelte';
	import { client } from '$lib/sanity';
	import { generateImageUrl } from '$lib/helper/image-url';

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
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
				{#each avatars as avatar (avatar._id)}
					<a
						href={avatar.link}
						target="_blank"
						rel="noopener noreferrer"
						class="group"
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