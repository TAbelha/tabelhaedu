import { sequence, type Handle } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { and, eq } from 'drizzle-orm';
import { createAuth, type Auth } from '#lib/server/auth/index.js';
import { member } from '#lib/server/db/schema/index.js';
import { getPlatform } from '#lib/server/platform.js';
import { normalizeHost, resolveOrg, type OrgContext } from '#lib/server/tenant/resolve.js';

const ORG_CACHE_TTL_MS = 60_000;
const orgCache = new Map<string, { org: OrgContext | null; expires: number }>();
let auth: Auth | undefined;

function getAuth(): Auth {
	const { d1, cfg, authSecret } = getPlatform();
	auth ??= createAuth(d1, { ...cfg, secret: authSecret });
	return auth;
}

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
	if (cached && cached.expires > Date.now()) {
		event.locals.org = cached.org;
	} else {
		const { db, cfg } = getPlatform();
		event.locals.org = await resolveOrg(db, host, cfg.defaultOrgSlug);
		orgCache.set(host, { org: event.locals.org, expires: Date.now() + ORG_CACHE_TTL_MS });
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
	const { org, user } = event.locals;
	if (org && user) {
		const { db, cfg } = getPlatform();
		const [row] = await db
			.select({ role: member.role })
			.from(member)
			.where(and(eq(member.organizationId, org.id), eq(member.userId, user.id)))
			.limit(1);
		event.locals.memberRole = row?.role ?? null;
		event.locals.isPlatformAdmin = cfg.platformAdmins.includes(user.email.toLowerCase());
	}
	return resolve(event);
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

export const handle = sequence(locals, org, session, roles, securityHeaders);
