import { describe, expect, it } from 'vitest';
import type { OrgContext, OrgSettings } from './resolve';
import { buildThemeCss, foregroundFor, isHexColor, orgHead } from './theme';

const blank: OrgSettings = {
	primaryColor: null,
	accentColor: null,
	radius: null,
	timezone: 'America/Sao_Paulo'
};

describe('isHexColor', () => {
	it('accepts only #rrggbb', () => {
		expect(isHexColor('#1d4ed8')).toBe(true);
		expect(isHexColor('#fff')).toBe(false);
		expect(isHexColor('red')).toBe(false);
	});
});

describe('foregroundFor', () => {
	it('picks white on dark colors', () => {
		expect(foregroundFor('#1d4ed8')).toBe('#ffffff');
	});

	it('picks near-black on light colors', () => {
		expect(foregroundFor('#fde047')).toBe('#0a0a0a');
	});
});

describe('buildThemeCss', () => {
	it('sets primary and its foreground', () => {
		const css = buildThemeCss({ ...blank, primaryColor: '#1d4ed8' });
		expect(css).toContain('--primary: #1d4ed8');
		expect(css).toContain('--primary-foreground: #ffffff');
		expect(css).toContain('--sidebar-primary: #1d4ed8');
		expect(css).toContain('--ring: #1d4ed8');
	});

	it('ignores values that are not colors', () => {
		const css = buildThemeCss({ ...blank, primaryColor: 'red;}</style><script>' });
		expect(css).not.toContain('<');
		expect(css).toBe('');
	});

	it('accepts only the known radius steps', () => {
		for (const radius of ['0', '0.25rem', '0.5rem', '0.75rem', '1rem']) {
			expect(buildThemeCss({ ...blank, radius })).toContain(`--radius: ${radius}`);
		}
		expect(buildThemeCss({ ...blank, radius: '3px' })).toBe('');
	});

	it('returns nothing when nothing is customized', () => {
		expect(buildThemeCss(blank)).toBe('');
	});
});

describe('orgHead', () => {
	it('escapes the org name in the title', () => {
		const org: OrgContext = {
			id: 'o',
			name: 'A & B <x>',
			slug: 'ab',
			logo: null,
			settings: blank
		};
		expect(orgHead(org)).toContain('<title>A &amp; B &lt;x&gt;</title>');
	});

	it('falls back to the platform name without an org', () => {
		expect(orgHead(null)).toBe('<title>tabelhaedu</title>');
	});
});
