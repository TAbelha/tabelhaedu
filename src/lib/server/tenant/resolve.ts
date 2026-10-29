import { eq } from 'drizzle-orm';
import type { Db } from '../db/index';
import { DEFAULT_TIMEZONE, orgDomain, orgSettings, organization } from '../db/schema/index';

export type OrgSettings = {
	primaryColor: string | null;
	accentColor: string | null;
	radius: string | null;
	timezone: string;
};

export type OrgContext = {
	id: string;
	name: string;
	slug: string;
	logo: string | null;
	settings: OrgSettings;
};

export function normalizeHost(host: string): string {
	return host.trim().toLowerCase().replace(/:\d+$/, '');
}

const orgColumns = {
	id: organization.id,
	name: organization.name,
	slug: organization.slug,
	logo: organization.logo,
	primaryColor: orgSettings.primaryColor,
	accentColor: orgSettings.accentColor,
	radius: orgSettings.radius,
	timezone: orgSettings.timezone
};

type OrgRow = {
	id: string;
	name: string;
	slug: string;
	logo: string | null;
	primaryColor: string | null;
	accentColor: string | null;
	radius: string | null;
	timezone: string | null;
};

function toContext(row: OrgRow): OrgContext {
	return {
		id: row.id,
		name: row.name,
		slug: row.slug,
		logo: row.logo,
		settings: {
			primaryColor: row.primaryColor,
			accentColor: row.accentColor,
			radius: row.radius,
			timezone: row.timezone ?? DEFAULT_TIMEZONE
		}
	};
}

export async function resolveOrg(
	db: Db,
	host: string,
	defaultOrgSlug: string | null
): Promise<OrgContext | null> {
	const [byHost] = await db
		.select(orgColumns)
		.from(orgDomain)
		.innerJoin(organization, eq(organization.id, orgDomain.organizationId))
		.leftJoin(orgSettings, eq(orgSettings.organizationId, organization.id))
		.where(eq(orgDomain.hostname, normalizeHost(host)))
		.limit(1);
	if (byHost) return toContext(byHost);
	if (!defaultOrgSlug) return null;

	const [bySlug] = await db
		.select(orgColumns)
		.from(organization)
		.leftJoin(orgSettings, eq(orgSettings.organizationId, organization.id))
		.where(eq(organization.slug, defaultOrgSlug))
		.limit(1);
	return bySlug ? toContext(bySlug) : null;
}
