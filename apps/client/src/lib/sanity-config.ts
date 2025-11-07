// Centralized Sanity configuration for consistent performance settings
export const SANITY_CONFIG = {
	// CDN and caching
	useCdn: true,
	
	// API versioning
	apiVersion: '2024-12-01',
	
	// Image optimization defaults
	imageDefaults: {
		quality: 85,
		format: 'webp',
		maxWidth: 1920
	},
	
	// Cache durations (in milliseconds)
	cacheDurations: {
		navigation: 60 * 60 * 1000, // 1 hour
		settings: 60 * 60 * 1000, // 1 hour
		pages: 5 * 60 * 1000, // 5 minutes
		blog: 5 * 60 * 1000 // 5 minutes
	}
};
