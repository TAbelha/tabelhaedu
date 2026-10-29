import { isHttpError, isRedirect } from '@sveltejs/kit';
import { describe, expect, it } from 'vitest';
import { requirePlatformAdmin, requireStaff, requireUser } from './guards';

function locals(overrides: Partial<App.Locals> = {}): App.Locals {
	return {
		org: {
			id: 'org-a',
			name: 'A',
			slug: 'a',
			logo: null,
			settings: {
				primaryColor: null,
				accentColor: null,
				radius: null,
				timezone: 'America/Sao_Paulo'
			}
		},
		user: { id: 'u1', name: 'Ana', email: 'ana@example.com' },
		session: { id: 's1' },
		memberRole: null,
		isPlatformAdmin: false,
		...overrides
	};
}

function thrown(fn: () => unknown): unknown {
	try {
		fn();
	} catch (e) {
		return e;
	}
	throw new Error('expected a throw');
}

describe('requireStaff', () => {
	it('rejects a signed-in user who is not a member', () => {
		expect(
			isHttpError(
				thrown(() => requireStaff(locals())),
				403
			)
		).toBe(true);
	});

	it('rejects a teacher asking for member management', () => {
		const e = thrown(() => requireStaff(locals({ memberRole: 'teacher' }), { member: ['create'] }));
		expect(isHttpError(e, 403)).toBe(true);
	});

	it('lets an owner through and returns the context', () => {
		const ctx = requireStaff(locals({ memberRole: 'owner' }), { member: ['create'] });
		expect(ctx.org.id).toBe('org-a');
		expect(ctx.role).toBe('owner');
	});
});

describe('requireUser', () => {
	it('redirects anonymous visitors to login with the return path', () => {
		const e = thrown(() =>
			requireUser(locals({ user: null, session: null }), new URL('https://a.example.com/admin?x=1'))
		);
		expect(isRedirect(e)).toBe(true);
		if (isRedirect(e)) {
			expect(e.status).toBe(303);
			expect(e.location).toBe('/login?next=%2Fadmin%3Fx%3D1');
		}
	});
});

describe('requirePlatformAdmin', () => {
	it('rejects non-admins', () => {
		expect(
			isHttpError(
				thrown(() => requirePlatformAdmin(locals())),
				403
			)
		).toBe(true);
	});
});
