import { describe, expect, it } from 'vitest';
import { isBlockedAuthPath } from './paths';

describe('isBlockedAuthPath', () => {
	it('blocks the organization plugin HTTP routes', () => {
		expect(isBlockedAuthPath('/api/auth/organization/list-invitations')).toBe(true);
		expect(isBlockedAuthPath('/api/auth/organization/update')).toBe(true);
		expect(isBlockedAuthPath('/api/auth/organization')).toBe(true);
	});

	it('keeps sign-in, sign-up and session routes open', () => {
		expect(isBlockedAuthPath('/api/auth/sign-in/email')).toBe(false);
		expect(isBlockedAuthPath('/api/auth/get-session')).toBe(false);
		expect(isBlockedAuthPath('/admin/organizacao')).toBe(false);
	});
});
