import { describe, expect, it } from 'vitest';
import {
	domainInput,
	inviteInput,
	orgProfileInput,
	orgThemeInput,
	platformOrgInput
} from './input';

describe('orgThemeInput', () => {
	it('normalizes colors and treats blanks as unset', () => {
		const r = orgThemeInput.parse({
			primaryColor: '#1D4ED8',
			accentColor: '',
			radius: '0.5rem',
			timezone: 'America/Manaus'
		});
		expect(r).toEqual({
			primaryColor: '#1d4ed8',
			accentColor: null,
			radius: '0.5rem',
			timezone: 'America/Manaus'
		});
	});

	it('rejects invalid colors, radius and timezone', () => {
		expect(
			orgThemeInput.safeParse({ primaryColor: 'red', timezone: 'America/Sao_Paulo' }).success
		).toBe(false);
		expect(orgThemeInput.safeParse({ radius: '3px', timezone: 'America/Sao_Paulo' }).success).toBe(
			false
		);
		expect(orgThemeInput.safeParse({ timezone: 'Mars/Base' }).success).toBe(false);
	});
});

describe('orgProfileInput', () => {
	it('trims the name and accepts an uploaded logo url', () => {
		const logo = '/media/org/org-a/0b6f1c2e-8a4d-4f7e-9c1a-2d3e4f5a6b7c.png';
		expect(orgProfileInput.parse({ name: '  Cursinho  ', logo })).toEqual({
			name: 'Cursinho',
			logo
		});
	});

	it('clears the logo when blank and rejects foreign urls', () => {
		expect(orgProfileInput.parse({ name: 'A', logo: '' }).logo).toBeNull();
		expect(
			orgProfileInput.safeParse({ name: 'A', logo: 'https://evil.example/x.png' }).success
		).toBe(false);
		expect(orgProfileInput.safeParse({ name: '   ', logo: '' }).success).toBe(false);
	});
});

describe('platformOrgInput', () => {
	it('accepts a slug and an optional hostname', () => {
		expect(
			platformOrgInput.parse({ name: 'Cursinho', slug: 'cursinho-2027', hostname: '' })
		).toEqual({
			name: 'Cursinho',
			slug: 'cursinho-2027',
			hostname: null
		});
		expect(
			platformOrgInput.parse({ name: 'C', slug: 'c1', hostname: 'Cursinho.Example.com' }).hostname
		).toBe('cursinho.example.com');
	});

	it('rejects bad slugs and hostnames', () => {
		expect(platformOrgInput.safeParse({ name: 'C', slug: 'Cursinho!', hostname: '' }).success).toBe(
			false
		);
		expect(platformOrgInput.safeParse({ name: 'C', slug: '-c', hostname: '' }).success).toBe(false);
		expect(
			platformOrgInput.safeParse({ name: 'C', slug: 'c1', hostname: 'not a host' }).success
		).toBe(false);
	});
});

describe('inviteInput', () => {
	it('lowercases the email and limits roles', () => {
		expect(inviteInput.parse({ email: 'Prof@Example.com', role: 'teacher' })).toEqual({
			email: 'prof@example.com',
			role: 'teacher'
		});
		expect(inviteInput.safeParse({ email: 'prof@example.com', role: 'owner' }).success).toBe(false);
	});
});

describe('domainInput', () => {
	it('lowercases hostnames and rejects junk', () => {
		expect(domainInput.parse({ hostname: ' Cursinho.Example.com ' }).hostname).toBe(
			'cursinho.example.com'
		);
		expect(domainInput.safeParse({ hostname: 'http://x.com' }).success).toBe(false);
	});
});
