// Test-only row builders.
import { organization } from '../db/schema/index';
import type { Db } from '../db/index';

export async function insertOrg(db: Db, slug: string, name = slug): Promise<string> {
	const id = `org-${slug}`;
	await db.insert(organization).values({ id, name, slug, createdAt: new Date() });
	return id;
}
