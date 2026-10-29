import { error, redirect } from '@sveltejs/kit';
import { can, type Permission } from '../permissions';
import type { OrgContext } from './tenant/resolve';

type User = NonNullable<App.Locals['user']>;

export function requireUser(locals: App.Locals, url: URL): User {
	if (!locals.user) {
		redirect(303, `/login?next=${encodeURIComponent(url.pathname + url.search)}`);
	}
	return locals.user;
}

export function requireOrg(locals: App.Locals): OrgContext {
	if (!locals.org) error(404, 'Organização não encontrada');
	return locals.org;
}

// Staff = a member of the current org; students are never members (they enroll in courses).
export function requireStaff(
	locals: App.Locals,
	perm?: Permission
): { org: OrgContext; user: User; role: string } {
	const org = requireOrg(locals);
	if (!locals.user || !locals.memberRole) error(403, 'Acesso restrito à equipe');
	if (perm && !can(locals.memberRole, perm)) error(403, 'Sem permissão para esta ação');
	return { org, user: locals.user, role: locals.memberRole };
}

export function requirePlatformAdmin(locals: App.Locals): User {
	if (!locals.user || !locals.isPlatformAdmin) error(403, 'Acesso restrito à plataforma');
	return locals.user;
}
