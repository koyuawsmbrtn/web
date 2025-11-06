<script lang="ts">
	import { deconstructLink } from '$lib/helper/link';
	import LinkButton from '../link-button.svelte';
	import { onMount } from 'svelte';

	let { portableText } = $props();
	const { value: button } = portableText;
	
	let linkData: { href: string; target: string } | null = $state(null);
	let mounted = $state(false);

	onMount(async () => {
		if (button?.link) {
			linkData = await deconstructLink(button.link);
		}
		mounted = true;
	});
</script>

{#if mounted && linkData}
	<LinkButton
		text={button?.text || ''}
		{linkData}
		variant="default"
		size="default"
	/>
{/if}
