<script lang="ts">
	import { onMount } from 'svelte';
	import { client } from '$lib/sanity';
	import { animate } from 'motion';
	import {
		RiGithubLine,
		RiInstagramLine,
		RiLinkedinLine,
		RiTwitchLine,
		RiFacebookLine,
		RiTwitterLine,
		RiYoutubeLine,
		RiTiktokLine,
		RiTelegramLine,
		RiFlickrLine,
		RiWhatsappLine,
		RiSnapchatLine,
		RiThreadsLine,
		RiXboxLine,
		RiPlaystationLine,
		RiSteamLine,
		RiWordpressLine,
		RiRssLine,
		RiXingLine,
		RiGlobeLine,
		RiFilmLine,
		RiBlueskyLine,
		RiMastodonLine
	} from 'svelte-remixicon';

	interface Social {
		_id: string;
		slug: { current: string };
		url: string;
		title: string;
	}

	const iconMap: Record<string, any> = {
		github: RiGithubLine,
		instagram: RiInstagramLine,
		linkedin: RiLinkedinLine,
		bluesky: RiBlueskyLine,
		twitch: RiTwitchLine,
		facebook: RiFacebookLine,
		twitter: RiTwitterLine,
		youtube: RiYoutubeLine,
		tiktok: RiTiktokLine,
		telegram: RiTelegramLine,
		flickr: RiFlickrLine,
		whatsapp: RiWhatsappLine,
		snapchat: RiSnapchatLine,
		threads: RiThreadsLine,
		xbox: RiXboxLine,
		playstation: RiPlaystationLine,
		steam: RiSteamLine,
		wordpress: RiWordpressLine,
		rss: RiRssLine,
		xing: RiXingLine,
		mastodon: RiMastodonLine,
		imdb: RiFilmLine,
		diaspora: RiGlobeLine
	};

	let socials = $state<Social[]>([]);
	let isLoading = $state(true);
	let error = $state(false);
	let containerEl = $state<HTMLElement>(undefined!);
	let hasPlayed = $state(false);

	const STAGGER_DELAY = 50;

	function animateSocials() {
		if (!containerEl) return;

		const items = containerEl.querySelectorAll<HTMLElement>('.social-link');

		items.forEach((el, index) => {
			const delay = index * STAGGER_DELAY;

			animate(
				el,
				{ opacity: [0, 1] },
				{
					duration: 0.3,
					delay: delay / 1000
				}
			);

			el.animate(
				[
					{ opacity: 0, transform: 'translateY(4px)' },
					{ opacity: 1, transform: 'translateY(0)' }
				],
				{
					duration: 300,
					delay,
					fill: 'forwards'
				}
			);
		});

		sessionStorage.setItem('socials-animation-played', 'true');
	}

	function getIcon(slug: string) {
		return iconMap[slug] || RiGlobeLine;
	}

	onMount(async () => {
		hasPlayed = sessionStorage.getItem('socials-animation-played') === 'true';

		try {
			const data = await client.fetch<Social[]>(
				`*[_type == "social"] { _id, slug, url, title }`
			);
			socials = data;
		} catch (err) {
			console.error('Error fetching socials:', err);
			error = true;
		} finally {
			isLoading = false;
		}
	});

	$effect(() => {
		if (!isLoading && socials.length > 0 && !hasPlayed) {
			requestAnimationFrame(() => {
				animateSocials();
			});
		}
	});
</script>

{#if !error && !isLoading && socials.length > 0}
	<div class="social-links" bind:this={containerEl}>
		{#each socials as social (social._id)}
			{@const IconComponent = getIcon(social.slug.current)}
			<a
				href={social.url}
				target="_blank"
				rel="noopener noreferrer me"
				title={social.title}
				class="social-link"
				style={hasPlayed ? '' : 'opacity: 0; transform: translateY(4px);'}
			>
				<IconComponent size="18" />
			</a>
		{/each}
	</div>
{/if}

<style>
	.social-links {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin-top: 1.25rem;
	}

	.social-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 0.5rem;
		color: oklch(0.55 0 0);
		transition: all 0.2s ease;
	}

	.social-link:hover {
		color: oklch(0.85 0 0);
		background: oklch(1 0 0 / 6%);
	}
</style>
