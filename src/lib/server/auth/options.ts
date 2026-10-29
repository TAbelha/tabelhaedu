// Pure Better Auth options, also loaded by the Better Auth CLI: no SvelteKit or #lib imports.
import type { BetterAuthOptions } from 'better-auth';
import { organization } from 'better-auth/plugins';
import { ac, roles } from '../../permissions';

export type AuthConfig = {
	appHosts: string[];
	platformAdmins: string[];
	secret?: string;
	secureCookies?: boolean;
};

function originsFor(hosts: string[]): string[] {
	return hosts.flatMap((host) => [`https://${host}`, `http://${host}`]);
}

export function buildAuthOptions(cfg: AuthConfig) {
	const platformAdmins = cfg.platformAdmins.map((email) => email.trim().toLowerCase());
	return {
		secret: cfg.secret,
		baseURL: { allowedHosts: cfg.appHosts, protocol: 'auto' },
		trustedOrigins: originsFor(cfg.appHosts),
		emailAndPassword: { enabled: true, requireEmailVerification: false, minPasswordLength: 8 },
		// Workers expose no NODE_ENV, so Better Auth's production defaults never switch on by themselves.
		rateLimit: { enabled: true, storage: 'database' },
		advanced: {
			useSecureCookies: cfg.secureCookies ?? false,
			ipAddress: { ipAddressHeaders: ['cf-connecting-ip'] }
		},
		plugins: [
			organization({
				ac,
				roles,
				creatorRole: 'owner',
				allowUserToCreateOrganization: (user) => platformAdmins.includes(user.email.toLowerCase()),
				invitationExpiresIn: 7 * 24 * 3600,
				// No transactional email in v0: invite links are copied from the team page.
				sendInvitationEmail: async () => {}
			})
		]
	} satisfies BetterAuthOptions;
}
