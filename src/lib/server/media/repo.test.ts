import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { media } from '../db/schema/index';
import { createTestDb } from '../testing/db';
import { insertOrg } from '../testing/fixtures';
import { storeMedia } from './repo';

// Minimal in-memory stand-in for the parts of R2Bucket that storeMedia uses.
function memoryBucket() {
	const objects = new Map<string, { body: ArrayBuffer; contentType?: string }>();
	const bucket = {
		async put(
			key: string,
			body: ArrayBuffer,
			options?: { httpMetadata?: { contentType?: string } }
		) {
			objects.set(key, { body, contentType: options?.httpMetadata?.contentType });
			return {};
		}
	};
	return { objects, bucket: bucket as unknown as R2Bucket };
}

describe('storeMedia', () => {
	it('stores the object under the org prefix and records it', async () => {
		const db = await createTestDb();
		const orgId = await insertOrg(db, 'a');
		const { objects, bucket } = memoryBucket();
		const file = new File([new Uint8Array(16)], 'logo.png', { type: 'image/png' });

		const stored = await storeMedia(db, bucket, orgId, null, file);

		expect(stored.key).toMatch(/^org\/org-a\/[0-9a-f-]{36}\.png$/);
		expect(stored.url).toBe(`/media/${stored.key}`);
		expect(objects.get(stored.key)?.contentType).toBe('image/png');
		const [row] = await db.select().from(media).where(eq(media.id, stored.id));
		expect(row).toMatchObject({ organizationId: orgId, key: stored.key, sizeBytes: 16 });
	});
});
