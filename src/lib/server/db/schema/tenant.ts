import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { organization, user } from './auth';

const createdAt = () =>
	integer('created_at', { mode: 'timestamp_ms' })
		.notNull()
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`);

// Hostnames that resolve to an organization (white-label entry points).
export const orgDomain = sqliteTable(
	'org_domain',
	{
		hostname: text('hostname').primaryKey(),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organization.id, { onDelete: 'cascade' }),
		isPrimary: integer('is_primary', { mode: 'boolean' }).notNull().default(false),
		createdAt: createdAt()
	},
	(t) => [index('org_domain_org_idx').on(t.organizationId)]
);

export const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

// Branding and locale; one row per organization, created on first update.
export const orgSettings = sqliteTable('org_settings', {
	organizationId: text('organization_id')
		.primaryKey()
		.references(() => organization.id, { onDelete: 'cascade' }),
	primaryColor: text('primary_color'),
	accentColor: text('accent_color'),
	radius: text('radius'),
	timezone: text('timezone').notNull().default(DEFAULT_TIMEZONE),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
});

export const media = sqliteTable(
	'media',
	{
		id: text('id').primaryKey(),
		organizationId: text('organization_id')
			.notNull()
			.references(() => organization.id, { onDelete: 'cascade' }),
		key: text('key').notNull().unique(),
		contentType: text('content_type').notNull(),
		sizeBytes: integer('size_bytes').notNull(),
		uploadedBy: text('uploaded_by').references(() => user.id, { onDelete: 'set null' }),
		createdAt: createdAt()
	},
	(t) => [index('media_org_idx').on(t.organizationId)]
);
