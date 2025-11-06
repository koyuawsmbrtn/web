<script lang="ts">
	interface SkeletonProps {
		className?: string;
	}

	let { className = '' }: SkeletonProps = $props();
</script>

<div
	class="bg-neutral-200 animate-pulse rounded-md {className}"
	data-slot="skeleton"
></div>