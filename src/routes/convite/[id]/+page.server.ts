import { fail, redirect } from '@sveltejs/kit';
import { authErrorMessage } from '#lib/server/auth/errors.js';
import { getAuth } from '#lib/server/auth/instance.js';
import { requireUser } from '#lib/server/guards.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, request, url }) => {
	const user = requireUser(locals, url);
	try {
		const invitation = await getAuth().api.getInvitation({
			headers: request.headers,
			query: { id: params.id }
		});
		return {
			invitation: {
				organizationName: invitation.organizationName,
				role: invitation.role,
				email: invitation.email
			},
			problem: null,
			signedInAs: user.email
		};
	} catch (e) {
		return { invitation: null, problem: authErrorMessage(e), signedInAs: user.email };
	}
};

export const actions: Actions = {
	accept: async ({ locals, params, request, url }) => {
		requireUser(locals, url);
		let organizationId: string;
		try {
			const accepted = await getAuth().api.acceptInvitation({
				headers: request.headers,
				body: { invitationId: params.id }
			});
			organizationId = accepted?.member.organizationId ?? '';
		} catch (e) {
			return fail(400, { message: authErrorMessage(e) });
		}
		// The admin area only exists on the host of the invitation's organization.
		redirect(303, organizationId === locals.org?.id ? '/admin' : '/');
	}
};
