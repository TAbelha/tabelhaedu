import { describe, expect, it } from 'vitest';
import { sql } from 'drizzle-orm';
import { createTestDb } from './db';

describe('createTestDb', () => {
	it('applies all migrations', async () => {
		const db = await createTestDb();
		const rows = await db.all<{ name: string }>(
			sql`select name from sqlite_master where type = 'table'`
		);
		const tables = rows.map((r) => r.name);
		for (const name of ['user', 'session', 'organization', 'member', 'invitation', 'rate_limit']) {
			expect(tables).toContain(name);
		}
	});
});
