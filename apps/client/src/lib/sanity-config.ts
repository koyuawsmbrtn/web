// Centralized Sanity configuration for consistent performance settings
export const SANITY_CONFIG = {
	// CDN and caching - DISABLED for instant updates
	useCdn: false,
	
	// API versioning
	apiVersion: '2024-12-01',
	
	// Image optimization defaults
	imageDefaults: {
		quality: 85,
		format: 'webp',
		maxWidth: 1920
	},
	
	// Cache durations (in milliseconds) - reduced for faster updates
	cacheDurations: {
		navigation: 5 * 60 * 1000, // 5 minutes
		settings: 5 * 60 * 1000, // 5 minutes
		pages: 1 * 60 * 1000, // 1 minute
		blog: 1 * 60 * 1000 // 1 minute
	}
};
