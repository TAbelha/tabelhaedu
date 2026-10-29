import { sequence, type Handle } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { and, eq } from 'drizzle-orm';
import { resolveAccess } from '#lib/server/access.js';
import { getAuth } from '#lib/server/auth/instance.js';
import { member } from '#lib/server/db/schema/index.js';
import { getPlatform } from '#lib/server/platform.js';
import { orgCache } from '#lib/server/tenant/cache.js';
import { normalizeHost, resolveOrg } from '#lib/server/tenant/resolve.js';
import { orgHead } from '#lib/server/tenant/theme.js';

const locals: Handle = ({ event, resolve }) => {
	event.locals.org = null;
	event.locals.user = null;
	event.locals.session = null;
	event.locals.memberRole = null;
	event.locals.isPlatformAdmin = false;
	return resolve(event);
};

const org: Handle = async ({ event, resolve }) => {
	if (building) return resolve(event);
	const host = normalizeHost(event.url.host);
	const cached = orgCache.get(host);
	if (cached) {
		event.locals.org = cached.org;
	} else {
		const { db, cfg } = getPlatform();
		event.locals.org = await resolveOrg(db, host, cfg.defaultOrgSlug);
		orgCache.set(host, event.locals.org);
	}
	return resolve(event);
};

const session: Handle = async ({ event, resolve }) => {
	if (building) return resolve(event);
	const auth = getAuth();
	const result = await auth.api.getSession({ headers: event.request.headers });
	if (result) {
		event.locals.user = {
			id: result.user.id,
			name: result.user.name,
			email: result.user.email
		};
		event.locals.session = { id: result.session.id };
	}
	return svelteKitHandler({ event, resolve, auth, building });
};

const roles: Handle = async ({ event, resolve }) => {
	const { db, cfg } = building ? { db: null, cfg: null } : getPlatform();
	if (db && cfg) {
		const access = await resolveAccess(
			{ orgId: event.locals.org?.id ?? null, user: event.locals.user },
			cfg.platformAdmins,
			async (orgId, userId) => {
				const [row] = await db
					.select({ role: member.role })
					.from(member)
					.where(and(eq(member.organizationId, orgId), eq(member.userId, userId)))
					.limit(1);
				return row?.role ?? null;
			}
		);
		event.locals.memberRole = access.memberRole;
		event.locals.isPlatformAdmin = access.isPlatformAdmin;
	}
	return resolve(event);
};

// Fills %tabelha.head% in app.html with the org's title and theme, so there is no flash of the default theme.
const theme: Handle = ({ event, resolve }) => {
	const head = orgHead(event.locals.org);
	return resolve(event, {
		// A replacer function keeps `$&`-style patterns in org names literal.
		transformPageChunk: ({ html }) => html.replace('%tabelha.head%', () => head)
	});
};

const securityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	if (event.url.protocol === 'https:') {
		response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
	}
	return response;
};

export const handle = sequence(locals, org, session, roles, theme, securityHeaders);
