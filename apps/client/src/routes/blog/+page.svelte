<script lang="ts">
	import type { PageData } from './$types';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import CoverImage from '$lib/components/cover-image.svelte';
	import SanityBlock from '$lib/components/sanity-block.svelte';
	import { formatDate } from '$lib/utils';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	const { blogs, intro, pagination, meta } = data;

	function createPageUrl(pageNum: number): string {
		const url = new URL($page.url);
		if (pageNum === 1) {
			url.searchParams.delete('page');
		} else {
			url.searchParams.set('page', pageNum.toString());
		}
		return url.pathname + url.search;
	}

	function getVisiblePages(): (number | 'ellipsis')[] {
		const { currentPage, totalPages } = pagination;
		const pages: (number | 'ellipsis')[] = [];

		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			pages.push(1);

			if (currentPage <= 4) {
				for (let i = 2; i <= 5; i++) {
					pages.push(i);
				}
				pages.push('ellipsis');
				pages.push(totalPages);
			} else if (currentPage >= totalPages - 3) {
				pages.push('ellipsis');
				for (let i = totalPages - 4; i <= totalPages; i++) {
					pages.push(i);
				}
			} else {
				pages.push('ellipsis');
				for (let i = currentPage - 1; i <= currentPage + 1; i++) {
					pages.push(i);
				}
				pages.push('ellipsis');
				pages.push(totalPages);
			}
		}

		return pages;
	}

	function navigateToPost(slug: string | undefined) {
		if (slug) {
			goto(`/blog/${slug}`);
		}
	}
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="/blog" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={meta.title} />
	<meta name="twitter:description" content={meta.description} />
</svelte:head>

<main class="container mx-auto min-h-screen max-w-6xl p-8">
	<header class="mb-12">
		<h1 class="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">Blog</h1>
		<p class="text-muted-foreground text-lg">
			{#if intro.content}
				<SanityBlock content={intro.content} />
			{:else if intro.html?.code}
				{@html intro.html.code}
			{/if}
		</p>
		{#if pagination.totalBlogs > 0}
			<p class="text-muted-foreground mt-2 text-sm">
				Showing {blogs.length} of {pagination.totalBlogs} posts
			</p>
		{/if}
	</header>

	{#if blogs.length === 0}
		<div class="py-16 text-center">
			<p class="text-muted-foreground text-lg">No blog posts found.</p>
		</div>
	{:else}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each blogs as blog}
				{@const publishedDate = blog.publishedAt
					? new Date(blog.publishedAt)
					: new Date(blog._createdAt)}
				{@const formattedDate = formatDate(publishedDate)}
				{@const extendedBlog = blog as any}

				<Card
					class="focus-within:ring-primary/20 group cursor-pointer overflow-hidden transition-all focus-within:ring-2 hover:shadow-md pt-0"
					onclick={() => navigateToPost(blog.slug?.current)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							navigateToPost(blog.slug?.current);
						}
					}}
					tabindex={0}
					role="button"
					aria-label="Read blog post: {blog.title}"
				>
					{#if blog.image?.asset}
						<div
							class="aspect-video overflow-hidden [&>img]:transition-transform [&>img]:duration-300 group-hover:[&>img]:scale-105"
						>
							<CoverImage
								image={blog.image}
								alt={blog.image.alt || blog.title || 'Blog cover image'}
								width={800}
								height={450}
							/>
						</div>
					{:else}
						<div class="bg-muted flex aspect-video items-center justify-center">
							<div class="text-center">
								<div class="text-muted-foreground mb-2 text-4xl">📝</div>
								<p class="text-muted-foreground text-sm">No cover image</p>
							</div>
						</div>
					{/if}

					<CardHeader class="pb-3">
						<CardTitle
							class="group-hover:text-primary text-xl leading-tight transition-colors"
						>
							{blog.title}
						</CardTitle>

						<div class="text-muted-foreground flex flex-col gap-1 text-sm">
							{#if blog.author}
								<div class="flex items-center gap-2">
									<span class="font-medium">By {blog.author}</span>
								</div>
							{/if}
							<div class="flex items-center gap-2">
								<span>{formattedDate}</span>
							</div>
						</div>

						{#if blog.tags && blog.tags.length > 0}
							<div class="mt-3 flex flex-wrap gap-1">
								{#each blog.tags.slice(0, 3) as tag}
									<span
										class="bg-muted text-muted-foreground inline-block rounded px-2 py-1 text-xs font-medium"
									>
										{tag}
									</span>
								{/each}
								{#if blog.tags.length > 3}
									<span class="text-muted-foreground text-xs">+{blog.tags.length - 3} more</span>
								{/if}
							</div>
						{/if}
					</CardHeader>

					<CardContent class="pt-0">
						{#if blog.excerpt || extendedBlog.description}
							<p class="text-muted-foreground mb-4 line-clamp-3 text-sm leading-relaxed">
								{blog.excerpt || extendedBlog.description}
							</p>
						{/if}

						<div
							class="text-primary group-hover:text-primary/80 inline-flex items-center text-sm font-medium transition-colors"
						>
							Read more
							<svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								></path>
							</svg>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>

		{#if pagination.totalPages > 1}
			<nav class="mt-12 flex justify-center" aria-label="Pagination">
				<div class="flex items-center gap-1">
					{#if pagination.hasPreviousPage}
						<Button
							variant="outline"
							size="sm"
							href={createPageUrl(pagination.currentPage - 1)}
							data-sveltekit-reload
						>
							<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 19l-7-7 7-7"
								></path>
							</svg>
							Previous
						</Button>
					{/if}

					{#each getVisiblePages() as pageItem}
						{#if pageItem === 'ellipsis'}
							<span class="text-muted-foreground px-3 py-2">...</span>
						{:else if pageItem === pagination.currentPage}
							<Button variant="default" size="sm" disabled>
								{pageItem}
							</Button>
						{:else}
							<Button
								variant="ghost"
								size="sm"
								href={createPageUrl(pageItem)}
								data-sveltekit-reload
							>
								{pageItem}
							</Button>
						{/if}
					{/each}

					{#if pagination.hasNextPage}
						<Button
							variant="outline"
							size="sm"
							href={createPageUrl(pagination.currentPage + 1)}
							data-sveltekit-reload
						>
							<svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 5l7 7-7 7"
								></path>
							</svg>
						</Button>
					{/if}
				</div>
			</nav>
		{/if}
	{/if}
</main>
