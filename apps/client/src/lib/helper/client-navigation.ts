// Client-side navigation utilities
// This file can be safely imported in client-side components

export interface NavigationItem {
	name: string;
	url?: string;
}

export interface Page {
	_id: string;
	title: string;
	slug: string | { current: string };
	sortOrder?: number;
}

/**
 * Creates navigation items from page data
 * This is a client-safe utility function
 */
export function createNavigationFromPages(pages: Page[], useBlog: boolean = true): NavigationItem[] {
	const navigationItems: NavigationItem[] = [];

	// Add home page
	navigationItems.push({
		name: 'Home',
		url: '/'
	});

	// Add blog page if enabled
	if (useBlog) {
		navigationItems.push({
			name: 'Blog',
			url: '/blog'
		});
	}

	// Add other pages, sorted by sortOrder
	const sortedPages = [...pages].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
	
	for (const page of sortedPages) {
		const slug = typeof page.slug === 'string' ? page.slug : page.slug.current;
		if (slug !== 'index') { // Skip index page as we already have Home
			navigationItems.push({
				name: page.title,
				url: `/${slug}`
			});
		}
	}

	return navigationItems;
}

/**
 * Creates default fallback navigation
 */
export function createDefaultNavigation(): NavigationItem[] {
	return [
		{ name: 'Home', url: '/' },
		{ name: 'Blog', url: '/blog' },
		{ name: 'About', url: '/about' },
		{ name: 'Contact', url: '/contact' }
	];
}