import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => ({
	org: locals.org
		? { id: locals.org.id, name: locals.org.name, slug: locals.org.slug, logo: locals.org.logo }
		: null,
	user: locals.user,
	memberRole: locals.memberRole,
	isPlatformAdmin: locals.isPlatformAdmin
});
