// Entry point for `bun run auth:schema` (Better Auth CLI); never imported by the app.
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { buildAuthOptions } from './src/lib/server/auth/options';

export const auth = betterAuth({
	...buildAuthOptions({ appHosts: ['localhost:*'], platformAdmins: [] }),
	// The CLI only needs the dialect to generate the schema; no live database is opened.
	database: drizzleAdapter({} as never, { provider: 'sqlite' })
});
