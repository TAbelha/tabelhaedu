import { describe, expect, it } from 'vitest';
import { createOrgCache } from './cache';
import type { OrgContext } from './resolve';

const org = { id: 'org-a', slug: 'a' } as OrgContext;

describe('createOrgCache', () => {
	it('returns entries until they expire', () => {
		let now = 0;
		const cache = createOrgCache(60_000, () => now);
		cache.set('a.example.com', org);
		expect(cache.get('a.example.com')).toEqual({ org });
		now = 60_001;
		expect(cache.get('a.example.com')).toBeUndefined();
	});

	it('caches misses too', () => {
		const cache = createOrgCache(60_000, () => 0);
		cache.set('unknown.example.com', null);
		expect(cache.get('unknown.example.com')).toEqual({ org: null });
	});

	it('drops every host of an invalidated org', () => {
		const cache = createOrgCache(60_000, () => 0);
		cache.set('a.example.com', org);
		cache.set('www.a.example.com', org);
		cache.set('unknown.example.com', null);
		cache.invalidate('org-a');
		expect(cache.get('a.example.com')).toBeUndefined();
		expect(cache.get('www.a.example.com')).toBeUndefined();
		expect(cache.get('unknown.example.com')).toEqual({ org: null });
	});
});

describe('forget', () => {
	it('drops a cached miss so a newly added domain resolves at once', () => {
		const cache = createOrgCache(60_000, () => 0);
		cache.set('new.example.com', null);
		cache.forget('new.example.com');
		expect(cache.get('new.example.com')).toBeUndefined();
	});
});
