import { describe, expect, it } from 'vitest';
import { resolveAccess } from './access';

const admins = ['admin@example.com'];
const lookup = async () => 'teacher';

describe('resolveAccess', () => {
	it('marks platform admins even when the host has no org', async () => {
		const access = await resolveAccess(
			{ orgId: null, user: { id: 'u1', email: 'Admin@Example.com' } },
			admins,
			lookup
		);
		expect(access).toEqual({ memberRole: null, isPlatformAdmin: true });
	});

	it('looks up the member role in the current org', async () => {
		const access = await resolveAccess(
			{ orgId: 'org-a', user: { id: 'u2', email: 'prof@example.com' } },
			admins,
			lookup
		);
		expect(access).toEqual({ memberRole: 'teacher', isPlatformAdmin: false });
	});

	it('grants nothing to anonymous visitors', async () => {
		expect(await resolveAccess({ orgId: 'org-a', user: null }, admins, lookup)).toEqual({
			memberRole: null,
			isPlatformAdmin: false
		});
	});
});
