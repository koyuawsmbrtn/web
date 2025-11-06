<script lang="ts">
	import { getFileAsset } from '@sanity/asset-utils';
	import { Download } from '@lucide/svelte';
	import { client } from '$lib/sanity';
	import Button from '../ui/button/button.svelte';

	let { portableText } = $props();
	const { value } = portableText;
	const { projectId, dataset } = client.config();
</script>

{#if value?.asset}
	{@const file = getFileAsset(value, { projectId, dataset })}
	<Button href={file.url} download class="inline-flex items-center gap-2 text-primary hover:underline">
		<Download size={16} />
		{value.title || 'Download file'}
	</Button>
{/if}
