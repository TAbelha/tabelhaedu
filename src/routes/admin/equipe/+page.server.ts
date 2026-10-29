import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { getAuth } from '#lib/server/auth/instance.js';
import { authErrorMessage } from '#lib/server/auth/errors.js';
import { firstIssue } from '#lib/server/forms.js';
import { requireStaff } from '#lib/server/guards.js';
import { getPlatform } from '#lib/server/platform.js';
import { NotFoundError } from '#lib/server/errors.js';
import {
	getPendingInvitation,
	listMembers,
	listPendingInvitations
} from '#lib/server/team/repo.js';
import { inviteInput } from '#lib/server/tenant/input.js';
import type { Actions, PageServerLoad } from './$types';

const PERM = { invitation: ['create'] } as const;
const idInput = z.object({ id: z.string().min(1) });

export const load: PageServerLoad = async ({ locals, url }) => {
	const { org, user } = requireStaff(locals, PERM);
	const { db } = getPlatform();
	const [members, invitations] = await Promise.all([
		listMembers(db, org.id),
		listPendingInvitations(db, org.id)
	]);
	return {
		members,
		invitations: invitations.map((i) => ({ ...i, link: `${url.origin}/convite/${i.id}` })),
		me: user.id
	};
};

async function fields(request: Request) {
	return Object.fromEntries(await request.formData());
}

// Better Auth re-checks the caller's role in the target organization on every call.
export const actions: Actions = {
	invite: async ({ locals, request, url }) => {
		const { org } = requireStaff(locals, PERM);
		const parsed = inviteInput.safeParse(await fields(request));
		if (!parsed.success) return fail(400, { message: firstIssue(parsed.error) });
		try {
			const invitation = await getAuth().api.createInvitation({
				headers: request.headers,
				body: { ...parsed.data, organizationId: org.id }
			});
			return {
				message: 'Convite criado. Copie o link e envie para a pessoa.',
				link: `${url.origin}/convite/${invitation.id}`
			};
		} catch (e) {
			return fail(400, { message: authErrorMessage(e) });
		}
	},
	cancel: async ({ locals, request }) => {
		const { org } = requireStaff(locals, { invitation: ['cancel'] });
		const parsed = idInput.safeParse(await fields(request));
		if (!parsed.success) return fail(400, { message: firstIssue(parsed.error) });
		try {
			await getPendingInvitation(getPlatform().db, org.id, parsed.data.id);
		} catch (e) {
			if (e instanceof NotFoundError) return fail(404, { message: 'Convite não encontrado.' });
			throw e;
		}
		try {
			await getAuth().api.cancelInvitation({
				headers: request.headers,
				body: { invitationId: parsed.data.id }
			});
			return { message: 'Convite cancelado.' };
		} catch (e) {
			return fail(400, { message: authErrorMessage(e) });
		}
	},
	remove: async ({ locals, request }) => {
		const { org, user } = requireStaff(locals, { member: ['delete'] });
		const parsed = idInput.safeParse(await fields(request));
		if (!parsed.success) return fail(400, { message: firstIssue(parsed.error) });
		const target = (await listMembers(getPlatform().db, org.id)).find(
			(m) => m.id === parsed.data.id
		);
		if (!target) return fail(404, { message: 'Membro não encontrado.' });
		if (target.userId === user.id)
			return fail(400, { message: 'Você não pode remover a si mesmo.' });
		try {
			await getAuth().api.removeMember({
				headers: request.headers,
				body: { memberIdOrEmail: target.id, organizationId: org.id }
			});
			return { message: `${target.name} foi removido da equipe.` };
		} catch (e) {
			return fail(400, { message: authErrorMessage(e) });
		}
	}
};
