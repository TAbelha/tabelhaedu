import { describe, expect, it } from 'vitest';
import { hostAllowed, readAppConfig } from './config';

const env = {
	APP_HOSTS: 'edu.example.workers.dev, cursinho.example.com',
	DEFAULT_ORG_SLUG: '',
	PLATFORM_ADMINS: 'Ian@Example.com',
	BETTER_AUTH_SECRET: 'x'.repeat(64)
};

describe('readAppConfig', () => {
	it('parses lists and normalizes admins', () => {
		const { cfg, authSecret } = readAppConfig(env);
		expect(cfg.appHosts).toEqual(['edu.example.workers.dev', 'cursinho.example.com']);
		expect(cfg.platformAdmins).toEqual(['ian@example.com']);
		expect(cfg.defaultOrgSlug).toBeNull();
		expect(authSecret).toBe('x'.repeat(64));
	});

	it('fails closed without an auth secret', () => {
		expect(() => readAppConfig({ ...env, BETTER_AUTH_SECRET: undefined })).toThrow();
		expect(() => readAppConfig({ ...env, BETTER_AUTH_SECRET: '' })).toThrow();
	});

	it('uses secure cookies unless every host is local', () => {
		expect(readAppConfig(env).cfg.secureCookies).toBe(true);
		expect(readAppConfig({ ...env, APP_HOSTS: 'localhost:*' }).cfg.secureCookies).toBe(false);
	});
});

describe('hostAllowed', () => {
	it('matches exact hosts and wildcard patterns, ignoring case', () => {
		expect(hostAllowed('localhost:5199', ['localhost:*'])).toBe(true);
		expect(hostAllowed('Cursinho.Example.com', ['cursinho.example.com'])).toBe(true);
		expect(hostAllowed('a.example.com', ['*.example.com'])).toBe(true);
	});

	it('rejects hosts outside the list', () => {
		expect(hostAllowed('evil.example', ['localhost:*'])).toBe(false);
		expect(hostAllowed('example.com', ['*.example.com'])).toBe(false);
		expect(hostAllowed('cursinho.example.com.evil.io', ['cursinho.example.com'])).toBe(false);
	});
});
