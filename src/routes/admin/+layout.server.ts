import { can } from '#lib/permissions.js';
import { requireStaff, requireUser } from '#lib/server/guards.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, url }) => {
	requireUser(locals, url);
	const { org, role } = requireStaff(locals);
	return {
		org: { id: org.id, name: org.name, slug: org.slug, logo: org.logo },
		canEditOrg: can(role, { organization: ['update'] }),
		canManageTeam: can(role, { invitation: ['create'] })
	};
};
