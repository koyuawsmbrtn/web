import type { PageServerLoad } from './$types';
import { serverClient } from '$lib/server/sanity';

const SKILLS_QUERY = `*[_type == "skillCloud"][0]{
	title,
	skills[] {
		name,
		category,
		proficiency
	}
}`;

export const load: PageServerLoad = async () => {
	try {
		const data = await serverClient.fetch(SKILLS_QUERY);

		return {
			title: data?.title || 'Skills',
			skills: data?.skills || []
		};
	} catch (err) {
		console.error('Error fetching skill cloud:', err);
		return {
			title: 'Skills',
			skills: []
		};
	}
};
