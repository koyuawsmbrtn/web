<script lang="ts">
	import { onMount } from 'svelte';
	import { animate } from 'motion';

	const LASTFM_API_KEY = 'd74f9fdb9c79a50ffac2ca0700892ca1';
	const username = 'bubblineyuri';
	const REFRESH_INTERVAL_MS = 30_000;
	const SESSION_KEY = 'listening-animation-played';

	interface LastFmTrack {
		name: string;
		url: string;
		artist: { '#text': string };
		image: Array<{ '#text': string; size: string }>;
		date?: { uts: string; '#text': string };
		'@attr'?: { nowplaying: string };
	}

	let track = $state<LastFmTrack | null>(null);
	let isLoading = $state(true);
	let hasError = $state(false);
	let cardEl = $state<HTMLElement>(undefined!);
	let hasPlayed = $state(false);

	function getAlbumArt(images: LastFmTrack['image']): string | null {
		const large = images.find((img) => img.size === 'large');
		const url = large?.['#text'] || images[images.length - 1]?.['#text'] || '';
		return url || null;
	}

	function getRelativeTime(uts: string): string {
		const now = Date.now();
		const then = parseInt(uts, 10) * 1000;
		const diffMs = now - then;
		const diffSec = Math.floor(diffMs / 1000);

		if (diffSec < 60) return 'just now';

		const diffMin = Math.floor(diffSec / 60);
		if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;

		const diffHr = Math.floor(diffMin / 60);
		if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;

		const diffDay = Math.floor(diffHr / 24);
		return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
	}

	async function fetchTrack() {
		try {
			const endpoint = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&format=json&api_key=${LASTFM_API_KEY}&limit=1&user=${username}`;
			const res = await fetch(endpoint);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			const tracks = data?.recenttracks?.track;
			if (tracks && tracks.length > 0) {
				track = tracks[0] as LastFmTrack;
			} else {
				track = null;
			}
			hasError = false;
		} catch (err) {
			console.error('Failed to fetch Last.fm data:', err);
			hasError = true;
		} finally {
			isLoading = false;
		}
	}

	function animateIn() {
		if (!cardEl || hasPlayed) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;

					animate(
						cardEl,
						{ opacity: [0, 1] },
						{
							duration: 0.6,
							ease: [0.4, 0.0, 0.2, 1.0] as [number, number, number, number],
						}
					);

					cardEl.animate(
						[
							{ filter: 'blur(12px)', transform: 'translateY(12px)' },
							{ filter: 'blur(0px)', transform: 'translateY(0px)' },
						],
						{
							duration: 600,
							easing: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
							fill: 'forwards',
						}
					);

					sessionStorage.setItem(SESSION_KEY, 'true');
					observer.unobserve(cardEl);
				});
			},
			{ threshold: 0.15 }
		);

		observer.observe(cardEl);
	}

	onMount(() => {
		hasPlayed = sessionStorage.getItem(SESSION_KEY) === 'true';

		fetchTrack();
		const interval = setInterval(fetchTrack, REFRESH_INTERVAL_MS);

		return () => clearInterval(interval);
	});

	$effect(() => {
		if (!isLoading && track && !hasError && cardEl) {
			requestAnimationFrame(() => {
				animateIn();
			});
		}
	});

	const isNowPlaying = $derived(track?.['@attr']?.nowplaying === 'true');
	const albumArt = $derived(track ? getAlbumArt(track.image) : null);
	const statusText = $derived(
		isNowPlaying
			? 'Listening now'
			: track?.date?.uts
				? getRelativeTime(track.date.uts)
				: ''
	);
</script>

{#if isLoading}
	<div class="card-container">
		<div class="card skeleton-card">
			<div class="skeleton-art"></div>
			<div class="skeleton-info">
				<div class="skeleton-line skeleton-line-wide"></div>
				<div class="skeleton-line skeleton-line-medium"></div>
				<div class="skeleton-line skeleton-line-narrow"></div>
			</div>
		</div>
	</div>
{:else if !hasError && track}
	<div
		class="card-container"
		bind:this={cardEl}
		style={hasPlayed ? '' : 'opacity: 0; filter: blur(12px); transform: translateY(12px);'}
	>
		<div class="card">
			{#if albumArt}
				<img
					class="album-art"
					src={albumArt}
					alt="{track.name} album art"
					loading="lazy"
				/>
			{:else}
				<div class="album-art-placeholder">🎵</div>
			{/if}

			<div class="track-info">
				<a
					href={track.url}
					target="_blank"
					rel="noopener noreferrer"
					class="track-name"
					title={track.name}
				>
					{track.name}
				</a>

				<span class="artist-name" title={track.artist['#text']}>
					{track.artist['#text']}
				</span>

				<span class="status-line">
					{#if isNowPlaying}
						<span class="pulse-dot"></span>
					{/if}
					{statusText}
				</span>
			</div>
		</div>
	</div>
{/if}

<style>
	.card-container {
		max-width: 24rem;
	}

	.card {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		border-radius: 1rem;
		border: 1px solid oklch(1 0 0 / 8%);
		background: linear-gradient(
			145deg,
			oklch(0.205 0 0 / 60%) 0%,
			oklch(0.17 0 0 / 40%) 100%
		);
		backdrop-filter: blur(8px);
	}

	.album-art {
		width: 56px;
		height: 56px;
		border-radius: 0.75rem;
		object-fit: cover;
		flex-shrink: 0;
	}

	.album-art-placeholder {
		width: 56px;
		height: 56px;
		border-radius: 0.75rem;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		background: oklch(0.2 0 0 / 80%);
	}

	.track-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
		flex: 1;
	}

	.track-name {
		color: white;
		font-weight: 500;
		font-size: 0.875rem;
		line-height: 1.25rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-decoration: none;
		transition: opacity 0.15s ease;
	}

	.track-name:hover {
		opacity: 0.8;
	}

	.artist-name {
		color: oklch(0.6 0 0);
		font-size: 0.75rem;
		line-height: 1rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.status-line {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		color: oklch(0.5 0 0);
		font-size: 0.75rem;
		line-height: 1rem;
		margin-top: 0.125rem;
	}

	.pulse-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #22c55e;
		flex-shrink: 0;
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(0.85);
		}
	}

	/* Skeleton loading state */
	.skeleton-card {
		pointer-events: none;
	}

	.skeleton-art {
		width: 56px;
		height: 56px;
		border-radius: 0.75rem;
		flex-shrink: 0;
		background: oklch(0.25 0 0);
		animation: shimmer 1.5s ease-in-out infinite;
	}

	.skeleton-info {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		flex: 1;
		min-width: 0;
	}

	.skeleton-line {
		height: 0.625rem;
		border-radius: 0.25rem;
		background: oklch(0.25 0 0);
		animation: shimmer 1.5s ease-in-out infinite;
	}

	.skeleton-line-wide {
		width: 75%;
	}

	.skeleton-line-medium {
		width: 55%;
	}

	.skeleton-line-narrow {
		width: 35%;
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
