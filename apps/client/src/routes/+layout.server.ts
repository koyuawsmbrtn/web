import { fetchSettings } from '$lib/settings';
import { getImage } from '$lib/helper/asset-to-url';
import { getCachedNavigation } from '$lib/helper/navigation';
import type { NavigationItem } from '$lib/components/navbar.svelte';

export const load = async ({
	locals: { preview }
}): Promise<{
	preview: boolean;
	settings: any;
	logo: any;
	navigation: NavigationItem[];
}> => {
	const settings = await fetchSettings();
	const logo = settings?.logo?.asset?._ref ? await getImage(settings.logo.asset._ref) : null;
	const navigation = await getCachedNavigation();

	return {
		preview,
		settings,
		logo,
		navigation
	};
};
