// Secrets set with `wrangler secret put` (or .dev.vars locally) are not in wrangler.jsonc,
// so `wrangler types` cannot see them.
declare namespace Cloudflare {
	interface Env {
		BETTER_AUTH_SECRET?: string;
		PLATFORM_ADMINS?: string;
	}
}
