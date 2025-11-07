<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import Skeleton from './ui/skeleton/skeleton.svelte';
	import { generateImageUrl } from '$lib/helper/image-url';
	import { browser } from '$app/environment';

	interface Page {
		_id: string;
		title: string;
		slug: string;
		sortOrder?: number;
	}

	interface NavigationSettings {
		logo?: any;
		websiteName?: string;
		showTextInMenu?: boolean;
		showLogoInMenu?: boolean;
		accentColor?: { hex: string };
		websiteDescription?: string;
		websiteUrl?: string;
	}

	interface NavigationItem {
		name: string;
		url?: string;
	}

	interface Props {
		settings?: NavigationSettings;
		navigationItems?: NavigationItem[];
		isLoading?: boolean;
	}

	let { settings, navigationItems = [], isLoading = false }: Props = $props();

	let pages = $state<Page[]>([]);
	let isMobileMenuOpen = $state(false);
	let scrollY = $state(0);
	let activeIndicator = $state<HTMLDivElement | null>(null);
	let navigationContainer = $state<HTMLDivElement | null>(null);

	// Scroll-based animations
	const logoX = tweened(0, { duration: 300, easing: cubicOut });
	const linksOpacity = tweened(1, { duration: 300, easing: cubicOut });
	const indicatorPosition = tweened({ left: 0, width: 0 }, { duration: 400, easing: cubicOut });

	// Convert navigation items to pages format when props change
	$effect(() => {
		if (navigationItems) {
			pages = navigationItems.map(item => ({
				_id: item.name.toLowerCase().replace(/\s+/g, '-'),
				title: item.name,
				slug: item.url?.replace('/', '') || '',
				sortOrder: 0
			}));
		}
	});

	// Update scroll-based animations
	$effect(() => {
		if (browser) {
			const logoOffset = Math.min(scrollY / 100, 1) * -24;
			const opacityValue = Math.max(1 - scrollY / 100, 0);
			
			logoX.set(logoOffset);
			linksOpacity.set(opacityValue);
		}
	});

	// Update active indicator position
	$effect(() => {
		if (browser && navigationContainer && pages.length > 0) {
			updateActiveIndicator();
		}
	});

	// Handle scroll events
	function handleScroll() {
		if (browser) {
			scrollY = window.scrollY;
		}
	}

	onMount(() => {
		if (browser) {
			window.addEventListener('scroll', handleScroll);
			return () => window.removeEventListener('scroll', handleScroll);
		}
	});

	// Helper function to check if link is active
	function isActive(slug: string): boolean {
		if (slug === '' && $page.url.pathname === '/') return true;
		if (slug !== '' && $page.url.pathname === `/${slug}`) return true;
		return false;
	}

	function updateActiveIndicator() {
		if (!navigationContainer) return;

		const activeIndex = pages.findIndex(page => isActive(page.slug));
		if (activeIndex === -1) return;

		const linkElements = navigationContainer.querySelectorAll('[data-nav-link]');
		const activeElement = linkElements[activeIndex];
		
		if (activeElement) {
			const containerRect = navigationContainer.getBoundingClientRect();
			const elementRect = activeElement.getBoundingClientRect();
			
			indicatorPosition.set({
				left: elementRect.left - containerRect.left,
				width: elementRect.width
			});
		}
	}

	function closeMobileMenu() {
		isMobileMenuOpen = false;
	}

	// Get logo URL using the existing helper
	function getLogoUrl() {
		if (settings?.logo) {
			return generateImageUrl(settings.logo, 32, 32);
		}
		return '/logo.svg';
	}

	// Get accent color with fallback
	function getAccentColor() {
		return settings?.accentColor?.hex || '#3b82f6';
	}
</script>

<svelte:window bind:scrollY />

<nav class="bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800/50 sticky top-0 z-50">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="relative flex items-center justify-between h-16">
			<!-- Logo - different versions for mobile and desktop -->
			<div class="shrink-0 flex items-center">
				<!-- Mobile logo - no animation -->
				<div class="sm:hidden flex items-center gap-3">
					<a href="/" class="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-neutral-800 transition-colors duration-200">
						{#if settings?.showLogoInMenu}
							<img
								src={getLogoUrl()}
								alt={settings?.websiteName || 'Logo'}
								width="24"
								height="24"
								loading="eager"
								fetchpriority="high"
								class="h-6 w-6 object-cover rounded-full"
							/>
						{/if}
						{#if settings?.showTextInMenu}
							<span class="text-sm font-medium text-yellow-400">
								{settings?.websiteName || 'Website'}
							</span>
						{/if}
					</a>
				</div>

				<!-- Desktop logo - with animation -->
				<div class="hidden sm:block">
					<div style="transform: translateX({$logoX}px)" class="flex items-center gap-3 transition-transform duration-300">
						<a href="/" class="flex items-center gap-3 px-3 py-2 rounded-4xl hover:bg-neutral-800 transition-all duration-200">
							{#if settings?.showLogoInMenu}
								<img
									src={getLogoUrl()}
									alt={settings?.websiteName || 'Logo'}
									width="24"
									height="24"
									loading="eager"
									fetchpriority="high"
									class="h-6 w-6 object-cover rounded-full"
								/>
							{/if}
							{#if settings?.showTextInMenu}
								<span class="text-sm font-medium text-yellow-400">
									{settings?.websiteName || 'Website'}
								</span>
							{/if}
						</a>
					</div>
				</div>
			</div>

			<!-- Desktop Navigation -->
			<div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
				<div 
					bind:this={navigationContainer}
					style="opacity: {$linksOpacity}; pointer-events: {$linksOpacity < 0.5 ? 'none' : 'auto'}" 
					class="relative flex items-center space-x-1 bg-neutral-900/50 rounded-full p-1 transition-opacity duration-300"
				>
					<!-- Active indicator with slide animation -->
					<div
						bind:this={activeIndicator}
						class="absolute top-1 bottom-1 bg-yellow-400/20 rounded-full transition-all duration-400 ease-out"
						style="left: {$indicatorPosition.left}px; width: {$indicatorPosition.width}px;"
					></div>
					
					{#if isLoading}
						<div class="flex items-center space-x-2 px-4 py-2">
							<Skeleton class="w-12 h-4 bg-neutral-700" />
							<Skeleton class="w-16 h-4 bg-neutral-700" />
							<Skeleton class="w-14 h-4 bg-neutral-700" />
						</div>
					{:else}
						{#each pages as page, index (page._id)}
							<a
								href="/{page.slug}"
								data-nav-link
								class="relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 z-10 {isActive(page.slug)
									? 'text-yellow-400'
									: 'text-neutral-300 hover:text-white hover:bg-neutral-800/50'}"
							>
								{page.title}
							</a>
						{/each}
						{#if pages.length === 0}
							<span class="text-neutral-500 px-4 py-2">No pages found</span>
						{/if}
					{/if}
				</div>
			</div>

			<!-- Mobile menu button -->
			<div class="flex items-center sm:hidden">
				<button
					type="button"
					class="inline-flex items-center justify-center p-2 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-600 transition-all duration-200"
					aria-controls="mobile-menu"
					aria-expanded={isMobileMenuOpen}
					onclick={() => isMobileMenuOpen = !isMobileMenuOpen}
				>
					<span class="sr-only">Open main menu</span>
					<svg
						class="{isMobileMenuOpen ? 'hidden' : 'block'} h-5 w-5 transition-transform duration-200"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16m-7 6h7"
						/>
					</svg>
					<svg
						class="{isMobileMenuOpen ? 'block' : 'hidden'} h-5 w-5 transition-transform duration-200"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</div>

		<!-- Mobile menu -->
		{#if isMobileMenuOpen}
			<div
				id="mobile-menu"
				class="sm:hidden overflow-hidden border-t border-neutral-800/50"
				transition:slide={{ duration: 300 }}
			>
				<div class="px-3 py-4 space-y-2 bg-neutral-950/50 backdrop-blur-sm">
					{#if isLoading}
						<div class="space-y-2">
							<Skeleton class="w-full h-10 bg-neutral-700" />
							<Skeleton class="w-3/4 h-10 bg-neutral-700" />
							<Skeleton class="w-1/2 h-10 bg-neutral-700" />
						</div>
					{:else}
						{#each pages as page (page._id)}
							<a
								href="/{page.slug}"
								class="block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 {isActive(page.slug)
									? 'text-yellow-400 bg-yellow-400/10'
									: 'text-neutral-300 hover:text-white hover:bg-neutral-800/50'}"
								onclick={closeMobileMenu}
							>
								{page.title}
							</a>
						{/each}
					{/if}
				</div>
			</div>
		{/if}
	</div>
</nav>