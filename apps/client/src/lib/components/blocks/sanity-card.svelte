<script lang="ts">
	import { generateImageUrl } from '$lib/helper/image-url';
	
	interface CardProps {
		value?: {
			title?: string;
			tag?: string;
			image?: {
				asset: {
					_ref: string;
				};
				alt?: string;
			};
			link?: string;
			content?: string;
		} | null;
	}

	let { value }: CardProps = $props();

	// Helper to get image URL using Svelte 5 $derived with null checks
	const imgUrl = $derived(
		value?.image ? generateImageUrl(value.image, 400, 250) : null
	);

	// Extract domain from URL for display with null checks
	const linkDomain = $derived(
		value?.link ? value.link.split('://')[1] : null
	);
</script>

<!-- Only render if value exists -->
{#if value}
	<div class="flex bg-neutral-900 text-neutral-100 rounded-lg shadow-lg overflow-hidden border border-neutral-800 my-6">
		{#if imgUrl}
			<div class="relative w-1/3" style="min-height: 200px;">
				{#if value.link}
					<a href={value.link} target="_blank" rel="noopener noreferrer">
						<img 
							src={imgUrl} 
							alt={value.image?.alt || value.title || ''}
							class="w-full h-full object-cover border-r border-neutral-700"
						/>
					</a>
				{:else}
					<img 
						src={imgUrl} 
						alt={value.image?.alt || value.title || ''}
						class="w-full h-full object-cover border-r border-neutral-700"
					/>
				{/if}
			</div>
		{/if}
		
		<div class="{imgUrl ? 'w-2/3' : 'w-full'} p-6 flex flex-col justify-center">
			{#if value.title}
				<h3 class="text-xl font-semibold text-neutral-100">
					{value.title}
				</h3>
			{/if}
			
			{#if value.content}
				<p class="mt-2 text-neutral-300">
					{value.content}
				</p>
			{/if}
			
			{#if value.link}
				<p class="mt-4 text-neutral-400">
					<a 
						href={value.link}
						target="_blank"
						rel="noopener noreferrer"
						class="flex items-center gap-1 hover:text-neutral-200 transition-colors"
					>
						{linkDomain}
						<svg 
							xmlns="http://www.w3.org/2000/svg" 
							width="16" 
							height="16" 
							viewBox="0 0 24 24" 
							fill="none" 
							stroke="currentColor"
							stroke-width="2" 
							stroke-linecap="round" 
							stroke-linejoin="round" 
							class="stroke-current"
						>
							<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
							<polyline points="15 3 21 3 21 9"></polyline>
							<line x1="10" y1="14" x2="21" y2="3"></line>
						</svg>
					</a>
				</p>
			{/if}
		</div>
	</div>
{:else}
	<!-- Debug: Show what we received -->
	<div class="my-6 p-4 border border-red-200 rounded-lg bg-red-50">
		<p class="text-red-600 text-sm">Card component received invalid data:</p>
		<pre class="text-xs text-red-500 mt-2">{JSON.stringify(value, null, 2)}</pre>
	</div>
{/if}