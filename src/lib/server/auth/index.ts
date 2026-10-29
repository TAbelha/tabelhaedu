import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { getDb, schema } from '../db/index';
import { buildAuthOptions, type AuthConfig } from './options';

export function createAuth(d1: D1Database, cfg: AuthConfig) {
	const options = buildAuthOptions(cfg);
	return betterAuth({
		...options,
		database: drizzleAdapter(getDb(d1), { provider: 'sqlite', schema }),
		// sveltekitCookies must stay the last plugin so it sees cookies set by the others.
		plugins: [...options.plugins, sveltekitCookies(getRequestEvent)]
	});
}

export type Auth = ReturnType<typeof createAuth>;
