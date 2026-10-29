import type { OrgContext } from './resolve';

// Per-isolate cache of host → org; misses are cached too so unknown hosts don't hit D1 every time.
export function createOrgCache(ttlMs: number, now: () => number = Date.now) {
	const entries = new Map<string, { org: OrgContext | null; expires: number }>();
	return {
		get(host: string): { org: OrgContext | null } | undefined {
			const entry = entries.get(host);
			if (!entry) return undefined;
			if (entry.expires <= now()) {
				entries.delete(host);
				return undefined;
			}
			return { org: entry.org };
		},
		set(host: string, org: OrgContext | null): void {
			entries.set(host, { org, expires: now() + ttlMs });
		},
		forget(host: string): void {
			entries.delete(host);
		},
		// Other isolates keep their copy until the TTL runs out.
		invalidate(orgId: string): void {
			for (const [host, entry] of entries) {
				if (entry.org?.id === orgId) entries.delete(host);
			}
		}
	};
}

export const orgCache = createOrgCache(60_000);
