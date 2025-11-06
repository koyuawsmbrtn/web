<script lang="ts">
	import { PortableText } from '@portabletext/svelte';

	let { portableText } = $props();
	const { value } = portableText;
</script>

{#if value?.content}
	<div class="bg-secondary text-secondary-foreground shadow-lg rounded-md p-6 border my-6 border-gray-200">
		<PortableText value={value.content} />
	</div>
{/if}
