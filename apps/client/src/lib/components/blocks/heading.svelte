<script lang="ts">
	import { cn } from '$lib/utils';

	let { portableText, children } = $props();
	const { value } = portableText;

	const getHeadingClass = (style: string) => {
		const baseClasses = 'font-bold';

		switch (style) {
			case 'h1':
				return cn(baseClasses, 'text-4xl md:text-5xl lg:text-6xl mb-6 mt-8');
			case 'h2':
				return cn(baseClasses, 'text-3xl md:text-4xl mb-4 mt-8');
			case 'h3':
				return cn(baseClasses, 'text-2xl md:text-3xl mb-3 mt-6');
			case 'h4':
				return cn(baseClasses, 'text-xl md:text-2xl mb-3 mt-6');
			case 'h5':
				return cn(baseClasses, 'text-lg md:text-xl mb-2 mt-4');
			case 'h6':
				return cn(baseClasses, 'text-base md:text-lg mb-2 mt-4');
			default:
				return cn(baseClasses, 'text-xl mb-3 mt-6');
		}
	};
</script>

{#if value.style === 'h1'}
	<h1 class={getHeadingClass(value.style)}>
		{@render children()}
	</h1>
{:else if value.style === 'h2'}
	<h2 class={getHeadingClass(value.style)}>
		{@render children()}
	</h2>
{:else if value.style === 'h3'}
	<h3 class={getHeadingClass(value.style)}>
		{@render children()}
	</h3>
{:else if value.style === 'h4'}
	<h4 class={getHeadingClass(value.style)}>
		{@render children()}
	</h4>
{:else if value.style === 'h5'}
	<h5 class={getHeadingClass(value.style)}>
		{@render children()}
	</h5>
{:else if value.style === 'h6'}
	<h6 class={getHeadingClass(value.style)}>
		{@render children()}
	</h6>
{/if}
