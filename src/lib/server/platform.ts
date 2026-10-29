// The only module that reads Cloudflare bindings; everything else receives them from here.
import { env } from 'cloudflare:workers';
import { getDb, type Db } from './db/index';

export type AppConfig = {
	appHosts: string[];
	defaultOrgSlug: string | null;
	platformAdmins: string[];
};

export type Platform = {
	d1: D1Database;
	db: Db;
	media: R2Bucket;
	cfg: AppConfig;
	authSecret: string;
};

function list(value: string | undefined): string[] {
	return (value ?? '')
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);
}

let platform: Platform | undefined;

// Bindings are fixed for the isolate's lifetime, so the platform is built once.
export function getPlatform(): Platform {
	platform ??= {
		d1: env.DB,
		db: getDb(env.DB),
		media: env.MEDIA,
		cfg: {
			appHosts: list(env.APP_HOSTS),
			defaultOrgSlug: env.DEFAULT_ORG_SLUG || null,
			platformAdmins: list(env.PLATFORM_ADMINS).map((email) => email.toLowerCase())
		},
		authSecret: env.BETTER_AUTH_SECRET ?? ''
	};
	return platform;
}
