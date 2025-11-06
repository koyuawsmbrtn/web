<script lang="ts">
	import { onMount } from 'svelte';
	import { client } from '$lib/sanity';
	import Avatars from '../avatars.svelte';
	import Contactform from './contactform.svelte';

	interface BlockReferenceProps {
		portableText: any;
	}

	let { portableText }: BlockReferenceProps = $props();
	const { value } = portableText;

	let blockref = $state<any>(null);
	let error = $state<string | null>(null);
	let loading = $state(true);

	onMount(async () => {
		console.log('=== BLOCK REFERENCE DEBUG ===');
		console.log('portableText:', portableText);
		console.log('value from portableText:', value);

		if (!value?.blockReference?._ref) {
			error = 'Invalid block reference';
			loading = false;
			console.log('No block reference found in value:', value);
			return;
		}

		try {
			const data = await client.fetch(`
				*[_type == "blockdocument" && _id == $blockId][0] {
					_id,
					title,
					html,
					type,
					tag
				}
			`, { blockId: value.blockReference._ref });

			if (!data) {
				error = 'Block not found';
			} else {
				blockref = data;
			}
		} catch (err) {
			console.error('Error fetching block:', err);
			error = 'Failed to load block content';
		} finally {
			loading = false;
		}
	});
</script>

{#if error}
	<div class="text-red-500 my-6 p-4 border border-red-200 rounded-lg bg-red-50">
		{error}
	</div>
{:else if loading}
	<div class="my-6 text-neutral-600 text-3xl text-center">...</div>
{:else if blockref}
	{#if blockref.tag === "avatars"}
		<Avatars />
	{:else if blockref.tag === "contact"}
		<Contactform />
	{:else if blockref.html?.code}
		<div class="sanity-block my-2">
			{@html blockref.html.code}
		</div>
	{:else}
		<div class="my-6 p-4 border border-neutral-200 rounded-lg">
			<h3 class="font-semibold">{blockref.title || 'Block Content'}</h3>
		</div>
	{/if}
{/if}