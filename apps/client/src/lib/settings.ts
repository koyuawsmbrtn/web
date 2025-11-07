import { serverClient } from './server/sanity';

export async function fetchSettings(prop?: string | undefined) {
	const settings = await serverClient.fetch(`*[_type == "settings"][0]{
		${
			prop ||
			`title,
			 longTitle,
			 footer,
			 description,
			 logo,
			 favicon,
			 websiteName,
			 showTextInMenu,
			 showLogoInMenu,
			 ogImage,
			 accentColor`
		}
	  }`);
	return settings;
}

export async function fetchNavigationSettings() {
	const settings = await serverClient.fetch(`*[_type == "settings"][0]{
		logo,
		websiteName,
		showTextInMenu,
		showLogoInMenu,
		accentColor,
		websiteDescription,
		websiteUrl
	}`);
	return settings;
}
