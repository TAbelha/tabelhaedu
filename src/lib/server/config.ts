// Pure parsing of the Worker's vars and secrets, kept apart from platform.ts so it can be tested.
export type AppConfig = {
	appHosts: string[];
	defaultOrgSlug: string | null;
	platformAdmins: string[];
	secureCookies: boolean;
};

export type RawEnv = {
	APP_HOSTS?: string;
	DEFAULT_ORG_SLUG?: string;
	PLATFORM_ADMINS?: string;
	BETTER_AUTH_SECRET?: string;
};

const LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\])(:|$)/;

function list(value: string | undefined): string[] {
	return (value ?? '')
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);
}

export function readAppConfig(env: RawEnv): { cfg: AppConfig; authSecret: string } {
	// Better Auth would silently fall back to a public default secret outside NODE_ENV=production.
	if (!env.BETTER_AUTH_SECRET) throw new Error('BETTER_AUTH_SECRET is not set');
	const appHosts = list(env.APP_HOSTS);
	return {
		cfg: {
			appHosts,
			defaultOrgSlug: env.DEFAULT_ORG_SLUG || null,
			platformAdmins: list(env.PLATFORM_ADMINS).map((email) => email.toLowerCase()),
			secureCookies: appHosts.some((host) => !LOCAL_HOST.test(host))
		},
		authSecret: env.BETTER_AUTH_SECRET
	};
}

function globToRegExp(pattern: string): RegExp {
	const escaped = pattern.split('*').map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'));
	return new RegExp(`^${escaped.join('.*')}$`);
}

// Same idea as Better Auth's allowedHosts matching: exact hosts or `*` wildcards.
export function hostAllowed(host: string, patterns: string[]): boolean {
	const normalized = host.toLowerCase();
	return patterns.some((pattern) => globToRegExp(pattern.toLowerCase()).test(normalized));
}
