// Test-only: an in-memory SQLite database with the real migrations applied.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { schema, type Db } from '../db/index';

const MIGRATIONS_DIR = path.resolve(import.meta.dirname, '../../../../drizzle');

export async function createTestDb(): Promise<Db> {
	const client = createClient({ url: ':memory:' });
	const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort();
	for (const file of files) {
		const content = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
		for (const statement of content.split('--> statement-breakpoint')) {
			if (statement.trim()) await client.execute(statement);
		}
	}
	// libsql and D1 share the SQLite dialect; tests exercise the same query builder.
	return drizzle(client, { schema }) as unknown as Db;
}
