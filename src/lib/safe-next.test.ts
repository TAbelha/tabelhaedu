import { describe, expect, it } from 'vitest';
import { safeNext } from './safe-next';

describe('safeNext', () => {
	it('keeps same-site paths', () => {
		expect(safeNext('/admin?x=1')).toBe('/admin?x=1');
	});

	it('rejects absolute and protocol-relative URLs', () => {
		expect(safeNext('https://evil.example')).toBe('/');
		expect(safeNext('//evil.example')).toBe('/');
		expect(safeNext('/\\evil.example')).toBe('/');
	});

	it('falls back when missing', () => {
		expect(safeNext(null)).toBe('/');
		expect(safeNext('', '/admin')).toBe('/admin');
	});
});
