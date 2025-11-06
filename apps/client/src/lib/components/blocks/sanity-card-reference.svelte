<script lang="ts">
	import { onMount } from 'svelte';
	import { client } from '$lib/sanity';
	import SanityCard from './sanity-card.svelte';

	interface CardReferenceProps {
		portableText: any;
	}

	let { portableText }: CardReferenceProps = $props();
	const { value } = portableText;

	let card = $state<any>(null);
	let error = $state<string | null>(null);
	let loading = $state(true);

	onMount(async () => {
		console.log('=== CARD COMPONENT DEBUG ===');
		console.log('portableText:', portableText);
		console.log('value from portableText:', value);
		
		// Try to get the card reference ID from the value
		let cardRef: string | undefined;
		
		// Check value since that's where the actual card data is
		if (value?.cardReference?._ref) {
			cardRef = value.cardReference._ref;
			console.log('Found cardRef in value.cardReference._ref:', cardRef);
		} else if (value?._ref) {
			cardRef = value._ref;
			console.log('Found cardRef in value._ref:', cardRef);
		}
		
		console.log('Final extracted card ref:', cardRef);
		
		if (!cardRef) {
			error = 'Invalid card reference - no _ref found';
			loading = false;
			console.log('No card reference found.');
			console.log('Value structure:', JSON.stringify(value, null, 2));
			return;
		}

		try {
			console.log('Fetching card with ID:', cardRef);
			
			const data = await client.fetch(`
				*[_type == "card" && _id == $cardId][0] {
					_id,
					title,
					tag,
					image,
					link,
					content
				}
			`, { cardId: cardRef });

			console.log('Fetched card data:', data);

			if (!data) {
				error = 'Card not found in Sanity';
			} else {
				card = data;
			}
		} catch (err) {
			console.error('Error fetching card:', err);
			error = 'Failed to load card content';
		} finally {
			loading = false;
		}
	});
</script>

{#if error}
	<div class="text-red-500 my-6 p-4 border border-red-200 rounded-lg bg-red-50">
		<p class="font-semibold">Card Error:</p>
		<p>{error}</p>
		<details class="mt-2">
			<summary class="cursor-pointer text-sm">Debug Info</summary>
			<div class="text-xs mt-1">
				<strong>Value:</strong>
				<pre>{JSON.stringify(value, null, 2)}</pre>
			</div>
		</details>
	</div>
{:else if loading}
	<div class="h-[202px] w-full my-6 bg-neutral-200 animate-pulse rounded-lg flex items-center justify-center"></div>
{:else if card}
	<SanityCard value={card} />
{:else}
	<div class="my-6 p-4 border border-neutral-200 rounded-lg bg-neutral-50">
		<p class="text-neutral-600">No card data available</p>
	</div>
{/if}