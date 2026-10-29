import { describe, expect, it } from 'vitest';
import { buildAuthOptions } from './options';

describe('buildAuthOptions', () => {
	const options = buildAuthOptions({
		appHosts: ['edu.example.workers.dev'],
		platformAdmins: [],
		secret: 's',
		secureCookies: true
	});

	it('turns rate limiting on explicitly (Workers expose no NODE_ENV)', () => {
		expect(options.rateLimit).toMatchObject({ enabled: true, storage: 'database' });
	});

	it('uses secure cookies and the Cloudflare client IP header', () => {
		expect(options.advanced.useSecureCookies).toBe(true);
		expect(options.advanced.ipAddress.ipAddressHeaders).toEqual(['cf-connecting-ip']);
	});
});
