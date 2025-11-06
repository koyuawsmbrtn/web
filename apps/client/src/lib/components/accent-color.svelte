<script lang="ts">
	import { onMount } from 'svelte';
	import { serverClient } from '$lib/server/sanity';

	interface Settings {
		accentColor: {
			hex: string;
		};
	}

	let oklchString = $state('oklch(0 0 0)');
	let textColor = $state('oklch(1 0 0)');

	// Convert hex to OKLCH (simplified version without culori dependency)
	function hexToOklch(hex: string): { oklch: string; textColor: string } {
		// Remove # if present
		hex = hex.replace('#', '');
		
		// Convert to RGB
		const r = parseInt(hex.substr(0, 2), 16) / 255;
		const g = parseInt(hex.substr(2, 2), 16) / 255;
		const b = parseInt(hex.substr(4, 2), 16) / 255;
		
		// Simple luminance calculation
		const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
		
		// For now, convert RGB to approximate OKLCH
		// This is a simplified conversion - you might want to use a proper color library
		const lightness = Math.sqrt(luminance);
		const chroma = Math.sqrt((r - luminance) ** 2 + (g - luminance) ** 2 + (b - luminance) ** 2);
		const hue = Math.atan2(g - luminance, r - luminance) * 180 / Math.PI;
		
		const oklchString = `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(0)})`;
		const textColor = lightness > 0.5 ? 'oklch(0 0 0)' : 'oklch(1 0 0)';
		
		return { oklch: oklchString, textColor };
	}

	onMount(async () => {
		try {
			const settings = await serverClient.fetch<Settings>(`
				*[_type == "settings"][0] {
					accentColor
				}
			`);

			if (settings?.accentColor?.hex) {
				const { oklch, textColor: calculatedTextColor } = hexToOklch(settings.accentColor.hex);
				oklchString = oklch;
				textColor = calculatedTextColor;
			}
		} catch (err) {
			console.error('Error fetching accent color:', err);
		}
	});
</script>

<svelte:head>
	<style>
		:root {
			--accent: {oklchString} !important;
			--text-accent: {textColor} !important;
		}
		.dark {
			--accent: {oklchString} !important;
			--text-accent: {textColor} !important;
		}
	</style>
</svelte:head>