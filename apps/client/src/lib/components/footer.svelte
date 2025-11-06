<script lang="ts">
	import { onMount } from 'svelte';
	import { client } from '$lib/sanity';
	import type { Settings } from '$lib/sanity.types';
	import {
		Github,
		MessageCircle,
		Instagram,
		Linkedin,
		Twitch,
		Facebook,
		Twitter,
		Youtube,
		Send,
		Camera,
		Phone,
		Ghost,
		Film,
		Music,
		Globe,
		Gamepad2,
		FileText,
		Rss,
		User,
		X
	} from 'lucide-svelte';

	let { settings }: { settings: Settings } = $props();

	interface LegalPage {
		_id: string;
		slug: string;
		title: string;
	}

	interface Social {
		_id: string;
		slug: {
			current: string;
		};
		url: string;
	}

	let legalPages = $state<LegalPage[]>([]);
	let socials = $state<Social[]>([]);
	let isLoading = $state(true);

	const getSocialIcon = (slug: string) => {
		const iconMap: Record<string, any> = {
			github: Github,
			mastodon: MessageCircle,
			discord: MessageCircle,
			instagram: Instagram,
			linkedin: Linkedin,
			bluesky: Twitter,
			twitch: Twitch,
			facebook: Facebook,
			twitter: Twitter,
			x: X,
			youtube: Youtube,
			tiktok: Music,
			telegram: Send,
			flickr: Camera,
			whatsapp: Phone,
			snapchat: Ghost,
			imdb: Film,
			lastfm: Music,
			diaspora: Globe,
			threads: MessageCircle,
			xbox: Gamepad2,
			playstation: Gamepad2,
			steam: Gamepad2,
			wordpress: FileText,
			rss: Rss,
			xing: User
		};
		return iconMap[slug] || Globe;
	};

	onMount(async () => {
		try {
			const [pagesData, socialsData] = await Promise.all([
				client.fetch<LegalPage[]>(`
					*[_type == "page" && slug.current in ["imprint", "privacy", "terms"]] {
						_id,
						"slug": slug.current,
						title
					}
				`),
				client.fetch<Social[]>(`
					*[_type == "social"] {
						_id,
						slug,
						url
					}
				`)
			]);
			legalPages = pagesData;
			socials = socialsData;
		} catch (error) {
			console.error('Error fetching footer data:', error);
		} finally {
			isLoading = false;
		}
	});

	const currentYear = new Date().getFullYear();
</script>

<footer class="bg-neutral-900 border-t border-neutral-700 mt-auto">
	<div class="container mx-auto px-4 py-6">
		<div class="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
			<div class="flex flex-col space-y-4">
				<div class="text-sm text-neutral-400">
					© {currentYear} {settings?.websiteName || 'Company'}. All rights reserved.
				</div>
				{#if socials.length > 0}
					<div class="flex space-x-3">
						{#each socials as social (social._id)}
							{@const IconComponent = getSocialIcon(social.slug.current)}
							<a
								href={social.url}
								target="_blank"
								rel="noopener noreferrer me"
								class="text-neutral-400 hover:text-neutral-200 transition-colors"
								aria-label={social.slug.current}
								title={social.slug.current}
							>
								<IconComponent size={20} />
							</a>
						{/each}
					</div>
				{/if}
			</div>
			
			{#if legalPages.length > 0}
				<nav class="flex space-x-6">
					{#each legalPages as page (page._id)}
						<a
							href="/{page.slug}"
							class="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
						>
							{page.title}
						</a>
					{/each}
				</nav>
			{/if}
		</div>
	</div>
</footer>
