<script lang="ts">
	import Button from "../ui/button/button.svelte";

	let { portableText, children } = $props();
	const { value } = portableText;
</script>

<Button 
	href={value.href} 
	variant="link"
	target={value.blank ? '_blank' : '_self'}
	rel={value.blank ? 'noopener noreferrer' : undefined}
	class="text-primary hover:underline p-0"
>
	{@render children()}
</Button>
