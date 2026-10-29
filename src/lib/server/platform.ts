// The only module that reads Cloudflare bindings; everything else receives them from here.
import { env } from 'cloudflare:workers';
import { readAppConfig, type AppConfig } from './config';
import { getDb, type Db } from './db/index';

export type { AppConfig };

export type Platform = {
	d1: D1Database;
	db: Db;
	media: R2Bucket;
	cfg: AppConfig;
	authSecret: string;
};

let platform: Platform | undefined;

// Bindings are fixed for the isolate's lifetime, so the platform is built once.
export function getPlatform(): Platform {
	platform ??= {
		d1: env.DB,
		db: getDb(env.DB),
		media: env.MEDIA,
		...readAppConfig(env)
	};
	return platform;
}
