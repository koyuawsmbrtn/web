<script lang="ts">
	import { onMount } from 'svelte';
	import { client } from '$lib/sanity';
	import { animate } from 'motion';

	interface Note {
		_id: string;
		title: string;
		slug: {
			current: string;
		};
		publishedAt?: string;
		_createdAt?: string;
		tags?: string[];
	}

	let notes = $state<Note[]>([]);
	let error = $state<string | null>(null);
	let isLoading = $state(true);
	let listEl = $state<HTMLElement>(undefined!);
	let hasPlayed = $state(false);

	const SESSION_KEY = 'notes-list-animation-played';

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function animateIn() {
		if (!listEl || hasPlayed) return;

		const items = listEl.querySelectorAll<HTMLElement>('.note-item');
		items.forEach((el, index) => {
			const delay = index * 0.06;

			animate(
				el,
				{ opacity: [0, 1] },
				{
					duration: 0.4,
					delay,
					ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
				}
			);

			el.animate(
				[
					{ filter: 'blur(6px)', transform: 'translateY(8px)' },
					{ filter: 'blur(0px)', transform: 'translateY(0px)' }
				],
				{
					duration: 400,
					delay: delay * 1000,
					easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
					fill: 'forwards'
				}
			);
		});

		sessionStorage.setItem(SESSION_KEY, 'true');
	}

	onMount(async () => {
		hasPlayed = sessionStorage.getItem(SESSION_KEY) === 'true';

		try {
			const notesData = await client.fetch<Note[]>(`
				*[_type == "note"] | order(publishedAt desc, _createdAt desc) {
					_id,
					title,
					slug,
					publishedAt,
					_createdAt,
					tags
				}
			`);

			notes = notesData;
		} catch (err) {
			console.error('Error fetching notes:', err);
			error = 'Failed to load notes';
		} finally {
			isLoading = false;
		}
	});

	$effect(() => {
		if (!isLoading && notes.length > 0 && !error && listEl) {
			requestAnimationFrame(() => {
				animateIn();
			});
		}
	});
</script>

{#if error}
	<div class="error-message">{error}</div>
{:else if isLoading}
	<div class="notes-skeleton">
		{#each Array(5) as _}
			<div class="skeleton-item">
				<div class="skeleton-line skeleton-title"></div>
				<div class="skeleton-line skeleton-meta"></div>
			</div>
		{/each}
	</div>
{:else if notes.length === 0}
	<p class="empty-message">No notes found.</p>
{:else}
	<div class="notes-list" bind:this={listEl}>
		{#each notes as note (note._id)}
			<a
				href="/notes/{note.slug.current}"
				class="note-item"
				style={hasPlayed ? '' : 'opacity: 0; filter: blur(6px); transform: translateY(8px);'}
			>
				<div class="note-content">
					<span class="note-title">{note.title}</span>
					{#if note.tags && note.tags.length > 0}
						<div class="note-tags">
							{#each note.tags.slice(0, 3) as tag}
								<span class="tag-pill">{tag}</span>
							{/each}
						</div>
					{/if}
				</div>
				{#if note.publishedAt || note._createdAt}
					<span class="note-date">
						{formatDate(note.publishedAt || note._createdAt || '')}
					</span>
				{/if}
				<svg class="note-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>
			</a>
		{/each}
	</div>
{/if}

<style>
	.notes-list {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-top: 0.5rem;
	}

	.note-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.875rem 1rem;
		border-radius: 0.75rem;
		border: 1px solid transparent;
		text-decoration: none;
		transition: all 0.2s ease;
		color: inherit;
	}

	.note-item:hover {
		background: oklch(1 0 0 / 4%);
		border-color: oklch(1 0 0 / 8%);
	}

	.note-item:hover .note-title {
		color: var(--accent-color, oklch(0.8 0 0));
	}

	.note-item:hover .note-arrow {
		opacity: 1;
		transform: translateX(2px);
	}

	.note-content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.note-title {
		font-size: 0.95rem;
		font-weight: 500;
		color: oklch(0.9 0 0);
		transition: color 0.2s ease;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.note-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}

	.tag-pill {
		display: inline-block;
		font-size: 0.65rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
		background: oklch(1 0 0 / 5%);
		color: oklch(0.55 0 0);
	}

	.note-date {
		flex-shrink: 0;
		font-size: 0.75rem;
		color: oklch(0.45 0 0);
		white-space: nowrap;
	}

	.note-arrow {
		flex-shrink: 0;
		opacity: 0;
		color: oklch(0.45 0 0);
		transition: all 0.2s ease;
	}

	/* Error */
	.error-message {
		color: oklch(0.65 0.2 25);
		font-size: 0.9rem;
		padding: 1rem;
		border-radius: 0.75rem;
		background: oklch(0.65 0.2 25 / 8%);
		border: 1px solid oklch(0.65 0.2 25 / 15%);
	}

	/* Empty */
	.empty-message {
		color: oklch(0.5 0 0);
		font-size: 0.9rem;
		padding: 2rem 0;
		text-align: center;
	}

	/* Skeleton */
	.notes-skeleton {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-top: 0.5rem;
	}

	.skeleton-item {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		padding: 0.875rem 1rem;
		border-radius: 0.75rem;
	}

	.skeleton-line {
		height: 0.625rem;
		border-radius: 0.25rem;
		background: oklch(0.25 0 0);
		animation: shimmer 1.5s ease-in-out infinite;
	}

	.skeleton-title {
		width: 60%;
	}

	.skeleton-meta {
		width: 30%;
	}

	.skeleton-item:nth-child(2) .skeleton-title { width: 45%; }
	.skeleton-item:nth-child(2) .skeleton-meta { width: 25%; }
	.skeleton-item:nth-child(3) .skeleton-title { width: 70%; }
	.skeleton-item:nth-child(3) .skeleton-meta { width: 35%; }
	.skeleton-item:nth-child(4) .skeleton-title { width: 50%; }
	.skeleton-item:nth-child(4) .skeleton-meta { width: 20%; }
	.skeleton-item:nth-child(5) .skeleton-title { width: 55%; }
	.skeleton-item:nth-child(5) .skeleton-meta { width: 28%; }

	@keyframes shimmer {
		0%,
		100% {
			opacity: 0.3;
		}
		50% {
			opacity: 0.6;
		}
	}
</style>
