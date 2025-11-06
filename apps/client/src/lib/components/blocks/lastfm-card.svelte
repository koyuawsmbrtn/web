<script lang="ts">
	import Card from '../ui/card/card.svelte';
	import CardHeader from '../ui/card/card-header.svelte';
	import CardContent from '../ui/card/card-content.svelte';
	import CardTitle from '../ui/card/card-title.svelte';
	import Skeleton from '../ui/skeleton.svelte';
	import { onMount } from 'svelte';

	interface LastFmTrack {
		name: string;
		url: string;
		artist: {
			'#text': string;
		};
		image: Array<{
			'#text': string;
			size: string;
		}>;
		date?: {
			uts: string;
			'#text': string;
		};
		'@attr'?: {
			nowplaying: string;
		};
	}

	interface LastFmResponse {
		recenttracks: {
			track: LastFmTrack[];
		};
	}

	// Configuration
	const LASTFM_API_KEY = "d74f9fdb9c79a50ffac2ca0700892ca1";
	const username = "bubblineyuri";

	// State
	let isLoading = $state(true);
	let error = $state<string | null>(null);
	let track = $state<LastFmTrack | null>(null);
	let relativeTime = $state<string | null>(null);
	let isNowPlaying = $state(false);

	// Convert unix timestamp to relative time
	function getRelativeTime(unixTime: string, dateText: string): string {
		const timeNow = Math.round(Date.now() / 1000);
		const timeDiff = timeNow - parseInt(unixTime);

		const SEC_IN_MIN = 60;
		const SEC_IN_HOUR = SEC_IN_MIN * 60;
		const SEC_IN_DAY = SEC_IN_HOUR * 24;

		if (timeDiff < SEC_IN_HOUR) {
			const minutes = Math.round(timeDiff / SEC_IN_MIN);
			return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
		}
		
		if (timeDiff >= SEC_IN_HOUR && timeDiff < SEC_IN_DAY) {
			const hours = Math.round(timeDiff / SEC_IN_HOUR);
			return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
		}
		
		if (timeDiff >= SEC_IN_DAY) {
			return dateText;
		}

		return dateText;
	}

	// Fetch Last.fm data
	async function fetchLastFmData() {
		try {
			isLoading = true;
			error = null;

			const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&format=json&api_key=${LASTFM_API_KEY}&limit=1&user=${username}`;
			
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data: LastFmResponse = await response.json();
			const lastTrack = data.recenttracks.track[0];

			if (!lastTrack) {
				throw new Error('No tracks found');
			}

			track = lastTrack;
			isNowPlaying = lastTrack['@attr']?.nowplaying === 'true';

			if (lastTrack.date && !isNowPlaying) {
				relativeTime = getRelativeTime(lastTrack.date.uts, lastTrack.date['#text']);
			} else {
				relativeTime = null;
			}

		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch Last.fm data';
			console.error('Last.fm fetch error:', err);
		} finally {
			isLoading = false;
		}
	}

	onMount(() => {
		fetchLastFmData();
		
		// Refresh data every 30 seconds
		const interval = setInterval(fetchLastFmData, 30000);
		
		return () => clearInterval(interval);
	});

	// Get the medium-sized image (index 1) or fallback to first available
	$effect(() => {
		if (track?.image) {
			console.log('Last.fm data:', {
				artist: track.artist['#text'],
				track: track.name,
				date: relativeTime,
				nowPlaying: isNowPlaying
			});
		}
	});

	function getAlbumCover(images: LastFmTrack['image']): string {
		if (!images || images.length === 0) return '';
		return images[1]?.['#text'] || images[0]?.['#text'] || '';
	}
</script>

<Card class="max-w-md">
	<CardContent>
		{#if isLoading}
			<div class="flex gap-4">
				<Skeleton className="w-16 h-16 rounded-md" />
				<div class="flex-1 space-y-2">
					<Skeleton className="h-4 w-3/4" />
					<Skeleton className="h-3 w-1/2" />
					<Skeleton className="h-3 w-1/3" />
				</div>
			</div>
		{:else if error}
			<div class="text-red-600 text-sm">
				<p>Unable to load Last.fm data</p>
				<p class="text-xs text-gray-500 mt-1">{error}</p>
			</div>
		{:else if track}
			<div class="flex gap-4">
				{#if getAlbumCover(track.image)}
					<img 
						src={getAlbumCover(track.image)} 
						alt="Album cover"
						class="w-16 h-16 rounded-md object-cover shadow-sm"
						loading="lazy"
					/>
				{:else}
					<div class="w-16 h-16 rounded-md bg-gray-200 flex items-center justify-center">
						<span class="text-gray-400 text-2xl">🎵</span>
					</div>
				{/if}
				
				<div class="flex-1 min-w-0">
					<div class="space-y-1">
						<a 
							href={track.url} 
							target="_blank" 
							rel="noopener noreferrer"
							class="font-medium text-sm"
							title={track.name}
						>
							{track.name}
						</a>
						
						<p class="text-muted-foreground text-sm truncate" title={track.artist['#text']}>
							{track.artist['#text']}
						</p>
						
						<a 
							href={`https://www.last.fm/user/${username}`}
							target="_blank"
							rel="noopener noreferrer"
							class="text-xs text-muted-foreground transition-colors block -mt-0.5"
						>
							{isNowPlaying ? 'Now playing...' : relativeTime || 'Recently played'}
						</a>
					</div>
				</div>
			</div>
		{/if}
	</CardContent>
</Card>