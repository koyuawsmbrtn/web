<script lang="ts">
	import { onMount } from 'svelte';
	import { animate } from 'motion';
	import { client } from '$lib/sanity';
	import { generateImageUrl } from '$lib/helper/image-url';

	const SESSION_KEY = 'posts-animation-played';

	interface Post {
		_id: string;
		title: string;
		slug: { current: string };
		publishedAt?: string;
		_createdAt: string;
		excerpt?: string;
		image?: any;
		tags?: string[];
		body?: any[];
		description?: string;
	}

	let posts = $state<Post[]>([]);
	let isLoading = $state(true);
	let hasError = $state(false);
	let gridEl = $state<HTMLElement>(undefined!);
	let viewAllEl = $state<HTMLElement>(undefined!);
	let hasPlayed = $state(false);

	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
	}

	async function fetchPosts() {
		try {
			const query = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc, _createdAt desc)[0...3]{
				_id,
				title,
				slug,
				publishedAt,
				_createdAt,
				excerpt,
				image,
				tags,
				body[0...1]
			}`;

			const results: Post[] = await client.fetch(query);

			posts = results.map((post) => {
				if (!post.excerpt) {
					const firstBlock = post.body?.[0];
					if (firstBlock?.children) {
						const text = firstBlock.children
							.map((child: any) => child.text)
							.filter(Boolean)
							.join('');
						post.description = text ? text.slice(0, 120) : undefined;
					}
				} else {
					post.description = post.excerpt;
				}
				return post;
			});

			hasError = false;
		} catch (err) {
			console.error('Failed to fetch latest posts:', err);
			hasError = true;
		} finally {
			isLoading = false;
		}
	}

	function animateIn() {
		if (!gridEl || hasPlayed) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;

					const cards = gridEl.querySelectorAll<HTMLElement>('.post-card');

					cards.forEach((card, index) => {
						const delay = index * 0.12;

						animate(
							card,
							{ opacity: [0, 1] },
							{
								duration: 0.5,
								delay,
								ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
							}
						);

						card.animate(
							[
								{ filter: 'blur(8px)', transform: 'translateY(12px)' },
								{ filter: 'blur(0px)', transform: 'translateY(0px)' }
							],
							{
								duration: 500,
								delay: delay * 1000,
								easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
								fill: 'forwards'
							}
						);
					});

					if (viewAllEl) {
						const linkDelay = cards.length * 0.12 + 0.1;

						animate(
							viewAllEl,
							{ opacity: [0, 1] },
							{
								duration: 0.5,
								delay: linkDelay,
								ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
							}
						);

						viewAllEl.animate(
							[
								{ filter: 'blur(8px)', transform: 'translateY(8px)' },
								{ filter: 'blur(0px)', transform: 'translateY(0px)' }
							],
							{
								duration: 500,
								delay: linkDelay * 1000,
								easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
								fill: 'forwards'
							}
						);
					}

					sessionStorage.setItem(SESSION_KEY, 'true');
					observer.unobserve(gridEl);
				});
			},
			{ threshold: 0.15 }
		);

		observer.observe(gridEl);
	}

	onMount(() => {
		hasPlayed = sessionStorage.getItem(SESSION_KEY) === 'true';
		fetchPosts();
	});

	$effect(() => {
		if (!isLoading && posts.length > 0 && !hasError && gridEl) {
			requestAnimationFrame(() => {
				animateIn();
			});
		}
	});
</script>

{#if isLoading}
	<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
		{#each Array(3) as _}
			<div class="post-card skeleton-card">
				<div class="skeleton-image"></div>
				<div class="card-content">
					<div class="skeleton-line skeleton-line-narrow"></div>
					<div class="skeleton-line skeleton-line-wide"></div>
					<div class="skeleton-line skeleton-line-medium"></div>
				</div>
			</div>
		{/each}
	</div>
{:else if !hasError && posts.length > 0}
	<div
		class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
		bind:this={gridEl}
	>
		{#each posts as post (post._id)}
			<a
				href="/blog/{post.slug.current}"
				class="post-card"
				style={hasPlayed ? '' : 'opacity: 0; filter: blur(8px); transform: translateY(12px);'}
			>
				{#if post.image}
					<div class="image-wrapper">
						<img
							class="post-image"
							src={generateImageUrl(post.image, 600)}
							alt={post.title}
							loading="lazy"
						/>
					</div>
				{/if}
				<div class="card-content">
					<span class="post-date">
						{formatDate(new Date(post.publishedAt || post._createdAt))}
					</span>
					<h3 class="post-title">{post.title}</h3>
					{#if post.description}
						<p class="post-excerpt">{post.description}</p>
					{/if}
					{#if post.tags && post.tags.length > 0}
						<div class="post-tags">
							{#each post.tags.slice(0, 2) as tag}
								<span class="tag-pill">{tag}</span>
							{/each}
						</div>
					{/if}
				</div>
			</a>
		{/each}
	</div>

	<a
		href="/blog"
		class="view-all"
		bind:this={viewAllEl}
		style={hasPlayed ? '' : 'opacity: 0; filter: blur(8px); transform: translateY(8px);'}
	>
		View all posts →
	</a>
{/if}

<style>
	.post-card {
		border-radius: 1rem;
		border: 1px solid oklch(1 0 0 / 6%);
		background: oklch(0.17 0 0 / 60%);
		overflow: hidden;
		transition: all 0.25s ease;
		text-decoration: none;
		display: flex;
		flex-direction: column;
	}

	.post-card:hover {
		border-color: oklch(1 0 0 / 12%);
		transform: translateY(-2px);
		box-shadow: 0 8px 30px oklch(0 0 0 / 20%);
	}

	.post-card:hover .post-title {
		color: var(--accent-color, oklch(0.7 0.15 250));
	}

	.post-card:hover .post-image {
		transform: scale(1.03);
	}

	.image-wrapper {
		overflow: hidden;
		aspect-ratio: 16 / 9;
	}

	.post-image {
		width: 100%;
		height: 100%;
		aspect-ratio: 16 / 9;
		object-fit: cover;
		display: block;
		transition: transform 0.3s ease;
	}

	.card-content {
		padding: 1rem 1.25rem 1.25rem;
	}

	.post-date {
		font-size: 0.75rem;
		color: oklch(0.5 0 0);
		margin-bottom: 0.5rem;
		display: block;
	}

	.post-title {
		font-size: 1rem;
		font-weight: 600;
		color: oklch(0.95 0 0);
		line-height: 1.4;
		margin-bottom: 0.5rem;
		transition: color 0.25s ease;
	}

	.post-excerpt {
		font-size: 0.85rem;
		color: oklch(0.5 0 0);
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		margin: 0;
	}

	.post-tags {
		margin-top: 0.75rem;
	}

	.tag-pill {
		display: inline-block;
		font-size: 0.65rem;
		padding: 0.2rem 0.5rem;
		border-radius: 9999px;
		background: oklch(1 0 0 / 5%);
		color: oklch(0.6 0 0);
		margin-right: 0.25rem;
	}

	.view-all {
		display: block;
		text-align: center;
		margin-top: 2rem;
		font-size: 0.9rem;
		color: var(--accent-color, oklch(0.6 0.15 250));
		text-decoration: none;
		transition: opacity 0.2s;
	}

	.view-all:hover {
		opacity: 0.7;
	}

	/* Skeleton loading state */
	.skeleton-card {
		pointer-events: none;
	}

	.skeleton-image {
		width: 100%;
		aspect-ratio: 16 / 9;
		background: oklch(0.25 0 0);
		animation: shimmer 1.5s ease-in-out infinite;
	}

	.skeleton-line {
		height: 0.625rem;
		border-radius: 0.25rem;
		background: oklch(0.25 0 0);
		animation: shimmer 1.5s ease-in-out infinite;
	}

	.skeleton-line-narrow {
		width: 35%;
		margin-bottom: 0.5rem;
	}

	.skeleton-line-wide {
		width: 85%;
		margin-bottom: 0.5rem;
	}

	.skeleton-line-medium {
		width: 65%;
	}

	@keyframes shimmer {
		0%,
		100% {
			opacity: 0.4;
		}
		50% {
			opacity: 0.8;
		}
	}
</style>
