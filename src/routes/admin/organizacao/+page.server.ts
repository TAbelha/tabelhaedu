import { fail } from '@sveltejs/kit';
import { firstIssue } from '#lib/server/forms.js';
import { ConflictError, NotFoundError } from '#lib/server/errors.js';
import { requirePlatformAdmin, requireStaff } from '#lib/server/guards.js';
import { getPlatform } from '#lib/server/platform.js';
import { orgCache } from '#lib/server/tenant/cache.js';
import { domainInput, orgProfileInput, orgThemeInput } from '#lib/server/tenant/input.js';
import {
	addDomain,
	listDomains,
	removeDomain,
	updateOrgProfile,
	updateOrgSettings
} from '#lib/server/tenant/repo.js';
import type { Actions, PageServerLoad } from './$types';

const PERM = { organization: ['update'] } as const;

export const load: PageServerLoad = async ({ locals }) => {
	const { org } = requireStaff(locals, PERM);
	return {
		profile: { name: org.name, logo: org.logo },
		settings: org.settings,
		domains: await listDomains(getPlatform().db, org.id),
		// No domain verification in v0: binding a hostname is a platform operator task.
		canManageDomains: locals.isPlatformAdmin
	};
};

async function fields(request: Request) {
	return Object.fromEntries(await request.formData());
}

export const actions: Actions = {
	profile: async ({ locals, request }) => {
		const { org } = requireStaff(locals, PERM);
		const parsed = orgProfileInput.safeParse(await fields(request));
		if (!parsed.success) return fail(400, { message: firstIssue(parsed.error) });
		await updateOrgProfile(getPlatform().db, org.id, parsed.data);
		orgCache.invalidate(org.id);
		return { message: 'Identidade atualizada.' };
	},
	theme: async ({ locals, request }) => {
		const { org } = requireStaff(locals, PERM);
		const parsed = orgThemeInput.safeParse(await fields(request));
		if (!parsed.success) return fail(400, { message: firstIssue(parsed.error) });
		await updateOrgSettings(getPlatform().db, org.id, parsed.data);
		orgCache.invalidate(org.id);
		return { message: 'Aparência atualizada.', reload: true };
	},
	addDomain: async ({ locals, request }) => {
		const { org } = requireStaff(locals, PERM);
		requirePlatformAdmin(locals);
		const parsed = domainInput.safeParse(await fields(request));
		if (!parsed.success) return fail(400, { message: firstIssue(parsed.error) });
		try {
			await addDomain(getPlatform().db, org.id, parsed.data.hostname);
		} catch (e) {
			if (e instanceof ConflictError) return fail(409, { message: 'Este domínio já está em uso.' });
			throw e;
		}
		orgCache.forget(parsed.data.hostname);
		return { message: 'Domínio adicionado.' };
	},
	removeDomain: async ({ locals, request }) => {
		const { org } = requireStaff(locals, PERM);
		requirePlatformAdmin(locals);
		const parsed = domainInput.safeParse(await fields(request));
		if (!parsed.success) return fail(400, { message: firstIssue(parsed.error) });
		try {
			await removeDomain(getPlatform().db, org.id, parsed.data.hostname);
		} catch (e) {
			if (e instanceof NotFoundError) return fail(404, { message: 'Domínio não encontrado.' });
			throw e;
		}
		orgCache.forget(parsed.data.hostname);
		return { message: 'Domínio removido.' };
	}
};
