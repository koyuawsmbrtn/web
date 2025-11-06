<script lang="ts">
	let { children } = $props();
</script>

<p class="mb-4 leading-relaxed text-foreground">
	{@render children()}
</p>
