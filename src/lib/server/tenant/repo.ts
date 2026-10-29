import { and, eq } from 'drizzle-orm';
import type { Db } from '../db/index';
import { orgDomain, orgSettings } from '../db/schema/index';
import { ConflictError, NotFoundError } from '../errors';
import { normalizeHost, type OrgSettings } from './resolve';

export async function updateOrgSettings(
	db: Db,
	orgId: string,
	input: Partial<OrgSettings>
): Promise<void> {
	const updatedAt = new Date();
	await db
		.insert(orgSettings)
		.values({ ...input, organizationId: orgId, updatedAt })
		.onConflictDoUpdate({ target: orgSettings.organizationId, set: { ...input, updatedAt } });
}

export async function addDomain(db: Db, orgId: string, hostname: string): Promise<void> {
	const host = normalizeHost(hostname);
	const [taken] = await db
		.select({ hostname: orgDomain.hostname })
		.from(orgDomain)
		.where(eq(orgDomain.hostname, host))
		.limit(1);
	if (taken) throw new ConflictError('duplicate', `Hostname ${host} is already in use`);

	const [existing] = await db
		.select({ hostname: orgDomain.hostname })
		.from(orgDomain)
		.where(eq(orgDomain.organizationId, orgId))
		.limit(1);
	await db
		.insert(orgDomain)
		.values({ hostname: host, organizationId: orgId, isPrimary: !existing });
}

export async function removeDomain(db: Db, orgId: string, hostname: string): Promise<void> {
	const removed = await db
		.delete(orgDomain)
		.where(
			and(eq(orgDomain.hostname, normalizeHost(hostname)), eq(orgDomain.organizationId, orgId))
		)
		.returning({ hostname: orgDomain.hostname });
	if (removed.length === 0) throw new NotFoundError();
}
