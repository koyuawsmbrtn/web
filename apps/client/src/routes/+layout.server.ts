import { fetchSettings } from '$lib/settings';
import { getImage } from '$lib/helper/asset-to-url';
import { getCachedNavigation } from '$lib/helper/navigation';
import type { NavigationItem } from '$lib/components/navbar.svelte';
import { client } from '$lib/sanity';

export const load = async ({
	locals: { preview }
}): Promise<{
	preview: boolean;
	settings: any;
	logo: any;
	navigation: NavigationItem[];
	accentColor: string;
}> => {
	const settings = await fetchSettings();
	const logo = settings?.logo?.asset?._ref ? await getImage(settings.logo.asset._ref) : null;
	const navigation = await getCachedNavigation();
	
	// Fetch accent color on server-side to avoid client-side fetch delay
	let accentColor = '#000000';
	try {
		const colorSettings = await client.fetch(`
			*[_type == "settings"][0] {
				accentColor
			}
		`);
		if (colorSettings?.accentColor?.hex) {
			accentColor = colorSettings.accentColor.hex;
		}
	} catch (err) {
		console.error('Error fetching accent color:', err);
	}

	return {
		preview,
		settings,
		logo,
		navigation,
		accentColor
	};
};
