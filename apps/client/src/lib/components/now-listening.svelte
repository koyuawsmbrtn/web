<script lang="ts">
	import { onMount } from 'svelte';
	import { animate } from 'motion';
	import { RiPlayLine, RiPauseLine, RiMusic2Line, RiVolumeUpLine } from 'svelte-remixicon';

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

	interface ITunesResult {
		trackName: string;
		artistName: string;
		previewUrl: string;
		artworkUrl100: string;
	}

	interface Props {
		playing?: boolean;
	}

	let { playing = $bindable(false) }: Props = $props();

	let track = $state<LastFmTrack | null>(null);
	let isLoading = $state(true);
	let hasError = $state(false);
	let cardEl = $state<HTMLElement>(undefined!);
	let hasPlayed = $state(false);

	// iTunes preview state
	let previewUrl = $state<string | null>(null);
	let previewAudio = $state<HTMLAudioElement | null>(null);
	let isPreviewPlaying = $state(false);
	let previewProgress = $state(0);
	let isLoadingPreview = $state(false);
	let canvasEl = $state<HTMLCanvasElement>(undefined!);
	let waveContainerEl = $state<HTMLElement>(undefined!);
	let animationFrameId: number | null = null;
	let audioContext: AudioContext | null = null;
	let analyser: AnalyserNode | null = null;
	let sourceNode: MediaElementAudioSourceNode | null = null;
	let sourceConnected = false;

	// Resolved accent color for canvas drawing (CSS vars can't be used in canvas API)
	let accentR = 200;
	let accentG = 200;
	let accentB = 200;
	let accentColorResolved = false;

	// Whether the idle wave loop is running
	let idleWaveRunning = false;

	function resolveAccentColor() {
		if (accentColorResolved) return;
		try {
			// Read from our own element — CSS custom properties inherit down the tree
			const el = cardEl || waveContainerEl || canvasEl;
			if (!el) return;

			const raw = getComputedStyle(el).getPropertyValue('--accent-color').trim();
			if (!raw) return;

			// Create a temporary element to resolve any color format (oklch, hsl, hex…) to rgb
			const tmp = document.createElement('div');
			tmp.style.color = raw;
			tmp.style.display = 'none';
			document.body.appendChild(tmp);
			const computed = getComputedStyle(tmp).color;
			document.body.removeChild(tmp);

			// Parse "rgb(r, g, b)" or "rgba(r, g, b, a)"
			const match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
			if (match && match[1] && match[2] && match[3]) {
				accentR = parseInt(match[1], 10);
				accentG = parseInt(match[2], 10);
				accentB = parseInt(match[3], 10);
				accentColorResolved = true;
			}
		} catch {
			// fallback stays as neutral default
		}
	}

	function accentRgba(alpha: number): string {
		return `rgba(${accentR}, ${accentG}, ${accentB}, ${alpha})`;
	}

	// Lighter variant (mix towards white)
	function accentLightRgba(alpha: number, lightness: number = 0.3): string {
		const r = Math.round(accentR + (255 - accentR) * lightness);
		const g = Math.round(accentG + (255 - accentG) * lightness);
		const b = Math.round(accentB + (255 - accentB) * lightness);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	// Darker/shifted variant
	function accentDarkRgba(alpha: number, shift: number = 0.25): string {
		const r = Math.round(accentR * (1 - shift));
		const g = Math.round(accentG * (1 - shift));
		const b = Math.round(Math.min(255, accentB * (1 + shift * 0.3)));
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

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
				const newTrack = tracks[0] as LastFmTrack;
				// If the track changed, fetch a new preview
				if (!track || newTrack.name !== track.name || newTrack.artist['#text'] !== track.artist['#text']) {
					track = newTrack;
					fetchPreview(newTrack.artist['#text'], newTrack.name);
				} else {
					track = newTrack;
				}
			} else {
				track = null;
				previewUrl = null;
			}
			hasError = false;
		} catch (err) {
			console.error('Failed to fetch Last.fm data:', err);
			hasError = true;
		} finally {
			isLoading = false;
		}
	}

	async function fetchPreview(artist: string, trackName: string) {
		try {
			const term = `${artist} ${trackName}`;
			const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=5`;
			const res = await fetch(url);
			if (!res.ok) {
				previewUrl = null;
				return;
			}
			const data = await res.json();
			if (data.results && data.results.length > 0) {
				// Try to find the best match
				const exactMatch = data.results.find((r: ITunesResult) =>
					r.trackName.toLowerCase() === trackName.toLowerCase() &&
					r.artistName.toLowerCase().includes(artist.toLowerCase())
				);
				const match = exactMatch || data.results[0];
				previewUrl = match.previewUrl || null;
			} else {
				previewUrl = null;
			}
		} catch (err) {
			console.error('Failed to fetch iTunes preview:', err);
			previewUrl = null;
		}
	}

	function setupAudioAnalyser() {
		if (!previewAudio || sourceConnected) return;

		try {
			audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
			analyser = audioContext.createAnalyser();
			analyser.fftSize = 256;
			analyser.smoothingTimeConstant = 0.8;

			sourceNode = audioContext.createMediaElementSource(previewAudio);
			sourceNode.connect(analyser);
			analyser.connect(audioContext.destination);
			sourceConnected = true;
		} catch (err) {
			console.error('Failed to setup audio analyser:', err);
		}
	}

	/** Draw idle ambient wave (no audio data — pure sine-based). */
	function drawIdleWave() {
		if (!canvasEl || isPreviewPlaying) {
			idleWaveRunning = false;
			return;
		}

		resolveAccentColor();

		const ctx = canvasEl.getContext('2d');
		if (!ctx) { idleWaveRunning = false; return; }

		const WIDTH = canvasEl.width / window.devicePixelRatio;
		const HEIGHT = canvasEl.height / window.devicePixelRatio;

		if (WIDTH === 0 || HEIGHT === 0) {
			animationFrameId = requestAnimationFrame(drawIdleWave);
			return;
		}

		ctx.save();
		ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
		ctx.clearRect(0, 0, WIDTH, HEIGHT);

		const time = Date.now() / 1000;

		const layers = [
			{ colorFn: () => accentRgba(0.18), blur: 16, heightScale: 0.35, speed: 0.6, phaseOffset: 0 },
			{ colorFn: () => accentDarkRgba(0.12), blur: 22, heightScale: 0.25, speed: 0.4, phaseOffset: 2.0 },
			{ colorFn: () => accentLightRgba(0.10, 0.35), blur: 12, heightScale: 0.20, speed: 0.8, phaseOffset: 4.0 },
		];

		const numPoints = 60;
		const sliceWidth = WIDTH / (numPoints - 1);

		for (const layer of layers) {
			ctx.save();
			ctx.filter = `blur(${layer.blur}px)`;
			ctx.beginPath();

			for (let i = 0; i < numPoints; i++) {
				const x = i * sliceWidth;
				const normalizedX = x / WIDTH;

				// Combine multiple sine waves for organic feel
				const wave1 = Math.sin(normalizedX * Math.PI * 3 + time * layer.speed + layer.phaseOffset) * 0.4;
				const wave2 = Math.sin(normalizedX * Math.PI * 5 + time * layer.speed * 1.3 + layer.phaseOffset * 0.7) * 0.25;
				const wave3 = Math.sin(normalizedX * Math.PI * 1.5 + time * layer.speed * 0.5 + layer.phaseOffset * 1.5) * 0.35;

				const combined = (wave1 + wave2 + wave3) * layer.heightScale;
				const y = HEIGHT - (combined * HEIGHT * 0.5 + HEIGHT * layer.heightScale * 0.5);

				if (i === 0) {
					ctx.moveTo(x, y);
				} else {
					const cpX = x - sliceWidth / 2;
					ctx.quadraticCurveTo(cpX, y, x, y);
				}
			}

			ctx.lineTo(WIDTH, HEIGHT);
			ctx.lineTo(0, HEIGHT);
			ctx.closePath();
			ctx.fillStyle = layer.colorFn();
			ctx.fill();
			ctx.restore();
		}

		ctx.restore();

		idleWaveRunning = true;
		animationFrameId = requestAnimationFrame(drawIdleWave);
	}

	/** Draw audio-reactive wave (uses analyser frequency data). */
	function drawActiveWave() {
		if (!canvasEl || !analyser || !isPreviewPlaying) {
			// Transition back to idle
			if (canvasEl && !isPreviewPlaying) {
				startIdleWave();
			}
			return;
		}

		resolveAccentColor();

		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;

		const WIDTH = canvasEl.width / window.devicePixelRatio;
		const HEIGHT = canvasEl.height / window.devicePixelRatio;

		if (WIDTH === 0 || HEIGHT === 0) {
			animationFrameId = requestAnimationFrame(drawActiveWave);
			return;
		}

		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);
		analyser.getByteFrequencyData(dataArray);

		ctx.save();
		ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
		ctx.clearRect(0, 0, WIDTH, HEIGHT);

		const layers = [
			{ colorFn: () => accentRgba(0.35), blur: 18, yOffset: 0, heightScale: 1.0, speed: 1.0 },
			{ colorFn: () => accentDarkRgba(0.25), blur: 24, yOffset: 4, heightScale: 0.8, speed: 0.7 },
			{ colorFn: () => accentLightRgba(0.20, 0.35), blur: 14, yOffset: -2, heightScale: 0.6, speed: 1.3 },
		];

		const time = Date.now() / 1000;

		for (const layer of layers) {
			ctx.save();
			ctx.filter = `blur(${layer.blur}px)`;
			ctx.beginPath();
			ctx.moveTo(0, HEIGHT);

			const usedBins = Math.floor(bufferLength * 0.4);
			const sliceWidth = WIDTH / usedBins;
			let x = 0;

			for (let i = 0; i < usedBins; i++) {
				const v = (dataArray[i] ?? 0) / 255.0;
				const wave = Math.sin(x * 0.015 + time * layer.speed * 2) * 0.3;
				const y = HEIGHT - (v * HEIGHT * layer.heightScale * 0.7 + wave * HEIGHT * 0.15) - layer.yOffset;

				if (i === 0) {
					ctx.moveTo(x, y);
				} else {
					const cpX = x - sliceWidth / 2;
					ctx.quadraticCurveTo(cpX, y, x, y);
				}
				x += sliceWidth;
			}

			ctx.lineTo(WIDTH, HEIGHT);
			ctx.lineTo(0, HEIGHT);
			ctx.closePath();
			ctx.fillStyle = layer.colorFn();
			ctx.fill();
			ctx.restore();
		}

		ctx.restore();

		animationFrameId = requestAnimationFrame(drawActiveWave);
	}

	function startIdleWave() {
		if (idleWaveRunning || isPreviewPlaying) return;
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
		idleWaveRunning = true;
		animationFrameId = requestAnimationFrame(drawIdleWave);
	}

	function startActiveWave() {
		idleWaveRunning = false;
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
		animationFrameId = requestAnimationFrame(drawActiveWave);
	}

	function togglePreview() {
		if (!previewUrl) return;

		if (isPreviewPlaying && previewAudio) {
			previewAudio.pause();
			isPreviewPlaying = false;
			playing = false;
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
				animationFrameId = null;
			}
			// Go back to idle wave
			startIdleWave();
			return;
		}

		if (!previewAudio) {
			isLoadingPreview = true;
			previewAudio = new Audio(previewUrl);
			previewAudio.crossOrigin = 'anonymous';
			previewAudio.volume = 0.5;

			previewAudio.addEventListener('canplaythrough', () => {
				isLoadingPreview = false;
			}, { once: true });

			previewAudio.addEventListener('timeupdate', () => {
				if (previewAudio && previewAudio.duration) {
					previewProgress = (previewAudio.currentTime / previewAudio.duration) * 100;
				}
			});

			previewAudio.addEventListener('ended', () => {
				isPreviewPlaying = false;
				playing = false;
				previewProgress = 0;
				startIdleWave();
			});

			previewAudio.addEventListener('error', () => {
				isLoadingPreview = false;
				isPreviewPlaying = false;
				playing = false;
				console.error('Failed to load preview audio');
				startIdleWave();
			});
		} else if (previewAudio.src !== previewUrl) {
			previewAudio.src = previewUrl;
			previewAudio.load();
		}

		// Resume AudioContext if suspended (autoplay policy)
		if (audioContext && audioContext.state === 'suspended') {
			audioContext.resume();
		}

		if (!sourceConnected) {
			setupAudioAnalyser();
		}

		previewAudio.play().then(() => {
			isPreviewPlaying = true;
			playing = true;
			isLoadingPreview = false;
			startActiveWave();
		}).catch((err) => {
			console.error('Playback failed:', err);
			isLoadingPreview = false;
		});
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

	function resizeCanvas() {
		if (canvasEl && waveContainerEl) {
			const rect = waveContainerEl.getBoundingClientRect();
			if (rect.width === 0 || rect.height === 0) return;
			canvasEl.width = rect.width * window.devicePixelRatio;
			canvasEl.height = rect.height * window.devicePixelRatio;
			canvasEl.style.width = rect.width + 'px';
			canvasEl.style.height = rect.height + 'px';
			// Don't set scale here — we handle it per-frame in draw functions
		}
	}

	onMount(() => {
		hasPlayed = sessionStorage.getItem(SESSION_KEY) === 'true';

		fetchTrack();
		const interval = setInterval(fetchTrack, REFRESH_INTERVAL_MS);

		// Resize canvas on window resize
		const handleResize = () => {
			resizeCanvas();
		};
		window.addEventListener('resize', handleResize);

		return () => {
			clearInterval(interval);
			window.removeEventListener('resize', handleResize);
			if (previewAudio) {
				previewAudio.pause();
				previewAudio = null;
			}
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
				animationFrameId = null;
			}
			idleWaveRunning = false;
			if (audioContext) {
				audioContext.close();
			}
		};
	});

	$effect(() => {
		if (!isLoading && track && !hasError && cardEl) {
			requestAnimationFrame(() => {
				animateIn();
				resizeCanvas();
			});
		}
	});

	// Start idle wave as soon as the canvas and container are bound
	$effect(() => {
		if (waveContainerEl && canvasEl) {
			resizeCanvas();
			// Kick off the idle ambient wave immediately
			if (!idleWaveRunning && !isPreviewPlaying) {
				resolveAccentColor();
				startIdleWave();
			}
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
	<div class="card-wrapper">
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
	</div>
{:else if !hasError && track}
	<div
		class="card-wrapper"
		bind:this={cardEl}
		style={hasPlayed ? '' : 'opacity: 0; filter: blur(12px); transform: translateY(12px);'}
	>
		<div class="card-container" class:is-playing-preview={isPreviewPlaying}>
			<div class="card">
				<!-- Album art with play button overlay -->
				<div class="album-art-wrapper">
					{#if albumArt}
						<img
							class="album-art"
							src={albumArt}
							alt="{track.name} album art"
							loading="lazy"
						/>
					{:else}
						<div class="album-art-placeholder">
							<RiMusic2Line size="24" />
						</div>
					{/if}

					{#if previewUrl}
						<button
							class="preview-btn"
							onclick={togglePreview}
							title={isPreviewPlaying ? 'Pause preview' : 'Play 30s preview'}
							disabled={isLoadingPreview}
						>
							{#if isLoadingPreview}
								<span class="preview-spinner"></span>
							{:else if isPreviewPlaying}
								<RiPauseLine size="18" />
							{:else}
								<RiPlayLine size="18" />
							{/if}
						</button>
					{/if}

					<!-- Progress ring around album art when playing -->
					{#if isPreviewPlaying || previewProgress > 0}
						<svg class="progress-ring" viewBox="0 0 60 60">
							<circle
								class="progress-ring-bg"
								cx="30"
								cy="30"
								r="28"
								fill="none"
								stroke-width="2.5"
							/>
							<circle
								class="progress-ring-fill"
								cx="30"
								cy="30"
								r="28"
								fill="none"
								stroke-width="2.5"
								stroke-dasharray={2 * Math.PI * 28}
								stroke-dashoffset={2 * Math.PI * 28 * (1 - previewProgress / 100)}
								transform="rotate(-90 30 30)"
							/>
						</svg>
					{/if}
				</div>

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
						{#if previewUrl && !isPreviewPlaying}
							<span class="preview-hint">· preview available</span>
						{/if}
						{#if isPreviewPlaying}
							<span class="preview-active">
								<RiVolumeUpLine size="12" />
								playing preview
							</span>
						{/if}
					</span>
				</div>
			</div>

			<!-- Wave animation container — always visible, taller when audio is playing -->
			<div
				class="wave-container"
				bind:this={waveContainerEl}
				class:wave-active={isPreviewPlaying}
			>
				<canvas bind:this={canvasEl} class="wave-canvas"></canvas>
				<div class="wave-glow" class:wave-glow-active={isPreviewPlaying}></div>
			</div>
		</div>
	</div>
{/if}

<style>
	.card-wrapper {
		width: 100%;
	}

	.card-container {
		position: relative;
		max-width: 24rem;
		overflow: hidden;
		border-radius: 1rem;
		border: 1px solid oklch(1 0 0 / 8%);
		background: linear-gradient(
			145deg,
			oklch(0.205 0 0 / 60%) 0%,
			oklch(0.17 0 0 / 40%) 100%
		);
		backdrop-filter: blur(8px);
		transition: border-color 0.5s ease, box-shadow 0.5s ease;
	}

	.card-container.is-playing-preview {
		border-color: color-mix(in oklch, var(--accent-color, #c8c8c8) 30%, transparent);
		box-shadow: 0 0 24px -8px color-mix(in oklch, var(--accent-color, #c8c8c8) 20%, transparent);
	}

	.card {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		position: relative;
		z-index: 2;
	}

	/* Album art with play overlay */
	.album-art-wrapper {
		position: relative;
		width: 56px;
		height: 56px;
		flex-shrink: 0;
		border-radius: 0.75rem;
		overflow: hidden;
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
		color: oklch(0.5 0 0);
	}

	.preview-btn {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: oklch(0 0 0 / 50%);
		color: white;
		border: none;
		cursor: pointer;
		opacity: 0;
		transition: opacity 0.2s ease;
		border-radius: 0.75rem;
		z-index: 3;
		padding: 0;
	}

	.preview-btn:hover {
		opacity: 1 !important;
	}

	.album-art-wrapper:hover .preview-btn {
		opacity: 0.85;
	}

	.preview-btn:disabled {
		cursor: wait;
	}

	.preview-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid oklch(1 0 0 / 30%);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Progress ring */
	.progress-ring {
		position: absolute;
		inset: -2px;
		width: calc(100% + 4px);
		height: calc(100% + 4px);
		z-index: 4;
		pointer-events: none;
	}

	.progress-ring-bg {
		stroke: oklch(1 0 0 / 8%);
	}

	.progress-ring-fill {
		stroke: var(--accent-color, #c8c8c8);
		stroke-linecap: round;
		transition: stroke-dashoffset 0.3s ease;
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
		flex-wrap: wrap;
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

	.preview-hint {
		color: oklch(0.45 0 0);
		font-size: 0.7rem;
	}

	.preview-active {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--accent-color, #c8c8c8);
		font-size: 0.7rem;
		font-weight: 500;
		animation: fade-in-active 0.3s ease;
	}

	@keyframes fade-in-active {
		from { opacity: 0; transform: translateX(-4px); }
		to { opacity: 1; transform: translateX(0); }
	}

	/* Wave animation — always present, grows taller when audio plays */
	.wave-container {
		position: relative;
		width: 100%;
		height: 28px;
		overflow: hidden;
		transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 1;
	}

	.wave-container.wave-active {
		height: 48px;
	}

	.wave-canvas {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.wave-glow {
		position: absolute;
		bottom: 0;
		left: 10%;
		right: 10%;
		height: 60%;
		background: radial-gradient(
			ellipse at center bottom,
			color-mix(in oklch, var(--accent-color, #c8c8c8) 15%, transparent) 0%,
			transparent 70%
		);
		pointer-events: none;
		opacity: 0.4;
		transition: opacity 0.5s ease;
		filter: blur(8px);
	}

	.wave-glow.wave-glow-active {
		opacity: 1;
	}

	/* Skeleton loading state */
	.skeleton-card {
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
		max-width: 24rem;
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
