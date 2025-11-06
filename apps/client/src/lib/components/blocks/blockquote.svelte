<script lang="ts">
	let { children } = $props();
</script>

<blockquote
	class="mt-6 border-l-4 border-primary pl-4 text-lg italic -mb-1"
>
	{@render children()}
</blockquote>
