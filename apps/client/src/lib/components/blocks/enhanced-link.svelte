<script lang="ts">
	import { onMount } from 'svelte';
	import { client } from '$lib/sanity';

	interface EnhancedLinkProps {
		portableText: any;
		children: any;
	}
	
	let { portableText, children }: EnhancedLinkProps = $props();
	const { value } = portableText;

	const href = value?.href || '';
	const isInternalLink = href.startsWith('/');

	let accentColor = $state('#3b82f6'); // Default blue fallback

	// Debug logging
	console.log('EnhancedLink called with:', { value, href, isInternalLink });

	onMount(async () => {
		try {
			const settings = await client.fetch(`
				*[_type == "settings"][0] {
					accentColor
				}
			`);

			if (settings?.accentColor?.hex) {
				accentColor = settings.accentColor.hex;
			}
		} catch (err) {
			console.error('Error fetching accent color:', err);
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

{#if isInternalLink}
	<a 
		href={href} 
		class="accent-link"
		style="color: {accentColor}; --hover-color: {hoverColor()};"
	>
		{@render children()}
	</a>
{:else}
	<a 
		href={href}
		target="_blank"
		rel="noopener noreferrer"
		class="accent-link"
		style="color: {accentColor}; --hover-color: {hoverColor()};"
	>
		{@render children()}
	</a>
{/if}