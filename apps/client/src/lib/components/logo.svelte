<script lang="ts">
	import type { Settings } from '$lib/sanity.types';
	import { generateImageUrl } from '$lib/helper/image-url';

	interface Props {
		settings: Settings;
		height?: number;
		width?: number;
		class?: string;
	}

	let { 
		settings, 
		height = 32, 
		width = 120, 
		class: className = '' 
	}: Props = $props();

	const logoUrl = generateImageUrl(settings.logo, width, height);
</script>

<div class="flex items-center gap-2 {className}">
	{#if logoUrl}
		<img src={logoUrl} alt="Logo" class="h-8 w-auto" />
	{/if}
	{#if settings.title}
		<span class="font-semibold text-lg">{settings.title}</span>
	{/if}
</div>
