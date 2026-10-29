import { and, desc, eq } from 'drizzle-orm';
import type { Db } from '../db/index';
import { orgDomain, orgSettings, organization } from '../db/schema/index';
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

export async function listDomains(db: Db, orgId: string) {
	return db
		.select({ hostname: orgDomain.hostname, isPrimary: orgDomain.isPrimary })
		.from(orgDomain)
		.where(eq(orgDomain.organizationId, orgId))
		.orderBy(desc(orgDomain.isPrimary), orgDomain.hostname);
}

export async function updateOrgProfile(
	db: Db,
	orgId: string,
	input: { name: string; logo: string | null }
): Promise<void> {
	await db.update(organization).set(input).where(eq(organization.id, orgId));
}

export async function listOrganizations(db: Db) {
	return db
		.select({
			id: organization.id,
			name: organization.name,
			slug: organization.slug,
			primaryDomain: orgDomain.hostname
		})
		.from(organization)
		.leftJoin(
			orgDomain,
			and(eq(orgDomain.organizationId, organization.id), eq(orgDomain.isPrimary, true))
		)
		.orderBy(organization.name);
}
