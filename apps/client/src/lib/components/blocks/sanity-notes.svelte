<script lang="ts">
	import { onMount } from 'svelte';
	import { client } from '$lib/sanity';

	interface Note {
		_id: string;
		title: string;
		slug: {
			current: string;
		};
		content: string;
	}

	let notes = $state<Note[]>([]);
	let error = $state<string | null>(null);
	let isLoading = $state(true);
	let accentColor = $state('#3b82f6'); // Default blue fallback

	onMount(async () => {
		try {
			// Fetch both notes and accent color in parallel
			const [notesData, settings] = await Promise.all([
				client.fetch<Note[]>(`
					*[_type == "note"] | order(title asc) {
						_id,
						title,
						slug,
						content
					}
				`),
				client.fetch(`
					*[_type == "settings"][0] {
						accentColor
					}
				`)
			]);

			notes = notesData;
			
			if (settings?.accentColor?.hex) {
				accentColor = settings.accentColor.hex;
			}
		} catch (err) {
			console.error('Error fetching notes:', err);
			error = 'Failed to load notes';
		} finally {
			isLoading = false;
		}
	});

	// Create a more transparent version for hover
	const hoverColor = $derived(() => {
		if (accentColor.startsWith('#')) {
			return accentColor + 'dd'; // Add alpha for transparency
		}
		return accentColor;
	});
</script>

<style>
	.accent-link {
		text-decoration: underline;
		transition: color 0.2s ease;
	}
	
	.accent-link:hover {
		color: var(--hover-color) !important;
	}
</style>

{#if error}
	<div class="text-red-500">{error}</div>
{:else if isLoading}
	<div class="space-y-2">
		<div class="h-6 w-1/2 bg-neutral-200 animate-pulse rounded my-1"></div>
		<div class="h-6 w-1/3 bg-neutral-200 animate-pulse rounded my-1"></div>
		<div class="h-6 w-2/3 bg-neutral-200 animate-pulse rounded my-1"></div>
		<div class="h-6 w-1/4 bg-neutral-200 animate-pulse rounded my-1"></div>
		<div class="h-6 w-3/4 bg-neutral-200 animate-pulse rounded my-1"></div>
		<div class="h-6 w-1/2 bg-neutral-200 animate-pulse rounded my-1"></div>
		<div class="h-6 w-1/3 bg-neutral-200 animate-pulse rounded my-1"></div>
		<div class="h-6 w-1/2 bg-neutral-200 animate-pulse rounded my-1"></div>
		<div class="h-6 w-1/3 bg-neutral-200 animate-pulse rounded my-1"></div>
		<div class="h-6 w-1/3 bg-neutral-200 animate-pulse rounded my-1"></div>
	</div>
{:else}
	<br />
	<ul class="space-y-1 list-disc list-inside">
		{#each notes as note (note._id)}
			<li class="text-lg">
				<a 
					href="/notes/{note.slug.current}" 
					class="accent-link"
					style="color: {accentColor}; --hover-color: {hoverColor()};"
				>
					{note.title}
				</a>
			</li>
		{/each}
	</ul>
	{#if notes.length === 0}
		<p class="text-neutral-500">No notes found :(</p>
	{/if}
{/if}