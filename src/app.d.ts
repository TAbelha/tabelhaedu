// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}

		// interface Error {}
		interface Locals {
			org: import('./lib/server/tenant/resolve').OrgContext | null;
			user: { id: string; name: string; email: string } | null;
			session: { id: string } | null;
			memberRole: string | null;
			isPlatformAdmin: boolean;
		}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
