<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';

	const { status, error } = $derived({
		status: $page.status,
		error: $page.error
	});

	const is404 = $derived(status === 404);
	const is500 = $derived(status >= 500);
</script>

<svelte:head>
	<title>{status} - {is404 ? 'Page Not Found' : 'Error'}</title>
	<meta name="description" content={is404 ? 'The page you are looking for could not be found.' : 'An error occurred while processing your request.'} />
</svelte:head>

<main class="container mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center p-8 text-center">
	<div class="space-y-6">
		<!-- Error Code -->
		<div class="space-y-2">
			<h1 class="font-mono text-6xl font-bold text-neutral-300 sm:text-8xl">
				{status}
			</h1>
		</div>

		<!-- Error Message -->
		<div class="space-y-4">
			{#if is404}
				<h2 class="text-2xl font-bold text-neutral-200 sm:text-3xl">
					Page Not Found
				</h2>
				<p class="max-w-md text-neutral-400">
					The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
				</p>
			{:else if is500}
				<h2 class="text-2xl font-bold text-neutral-200 sm:text-3xl">
					Server Error
				</h2>
				<p class="max-w-md text-neutral-400">
					Something went wrong on our end. Please try again later or contact support if the problem persists.
				</p>
			{:else}
				<h2 class="text-2xl font-bold text-neutral-200 sm:text-3xl">
					Something went wrong
				</h2>
				<p class="max-w-md text-neutral-400">
					{error?.message || 'An unexpected error occurred. Please try again.'}
				</p>
			{/if}
		</div>

		<!-- Actions -->
		<div class="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-4">
			<Button onclick={() => goto('/')}>
				← Back to Home
			</Button>
		</div>

		<!-- Additional Help for 404 -->
		{#if is404}
			<div class="mt-8 space-y-3">
				<p class="text-sm text-neutral-500">Looking for something specific?</p>
				<div class="flex flex-wrap justify-center gap-2 text-sm">
					<a href="/" class="text-neutral-400 hover:text-neutral-200 transition-colors">Home</a>
					<span class="text-neutral-600">•</span>
					<a href="/blog" class="text-neutral-400 hover:text-neutral-200 transition-colors">Blog</a>
					<span class="text-neutral-600">•</span>
					<a href="/about" class="text-neutral-400 hover:text-neutral-200 transition-colors">About</a>
					<span class="text-neutral-600">•</span>
					<a href="/contact" class="text-neutral-400 hover:text-neutral-200 transition-colors">Contact</a>
				</div>
			</div>
		{/if}
	</div>
</main>