import { fail } from '@sveltejs/kit';
import { authErrorMessage } from '#lib/server/auth/errors.js';
import { getAuth } from '#lib/server/auth/instance.js';
import { ConflictError } from '#lib/server/errors.js';
import { firstIssue } from '#lib/server/forms.js';
import { requirePlatformAdmin, requireUser } from '#lib/server/guards.js';
import { getPlatform } from '#lib/server/platform.js';
import { orgCache } from '#lib/server/tenant/cache.js';
import { platformOrgInput } from '#lib/server/tenant/input.js';
import { addDomain, listOrganizations, updateOrgSettings } from '#lib/server/tenant/repo.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	requireUser(locals, url);
	requirePlatformAdmin(locals);
	return { organizations: await listOrganizations(getPlatform().db) };
};

export const actions: Actions = {
	create: async ({ locals, request }) => {
		requirePlatformAdmin(locals);
		const parsed = platformOrgInput.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { message: firstIssue(parsed.error) });
		const { name, slug, hostname } = parsed.data;

		let orgId: string;
		try {
			// The platform admin becomes the owner of the new organization.
			const created = await getAuth().api.createOrganization({
				headers: request.headers,
				body: { name, slug }
			});
			if (!created) return fail(400, { message: 'Não foi possível criar a instituição.' });
			orgId = created.id;
		} catch (e) {
			return fail(400, { message: authErrorMessage(e) });
		}

		const { db } = getPlatform();
		await updateOrgSettings(db, orgId, {});
		if (hostname) {
			try {
				await addDomain(db, orgId, hostname);
				orgCache.forget(hostname);
			} catch (e) {
				if (!(e instanceof ConflictError)) throw e;
				return fail(409, {
					message: `Instituição criada, mas o domínio ${hostname} já está em uso.`
				});
			}
		}
		return { message: `Instituição ${name} criada.` };
	}
};
