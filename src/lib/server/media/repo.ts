import type { Db } from '../db/index';
import { media } from '../db/schema/index';
import { ConflictError } from '../errors';
import { CONTENT_TYPES, validateUpload } from './validate';

export async function storeMedia(
	db: Db,
	bucket: R2Bucket,
	orgId: string,
	userId: string | null,
	file: File
): Promise<{ id: string; key: string; url: string }> {
	const check = validateUpload(file);
	if (!check.ok) throw new ConflictError('invalid', `Upload rejected: ${check.reason}`);

	const id = crypto.randomUUID();
	const key = `org/${orgId}/${id}.${check.ext}`;
	// The served type comes from the validated extension, never from the client's header.
	const contentType = CONTENT_TYPES[check.ext];
	await bucket.put(key, await file.arrayBuffer(), { httpMetadata: { contentType } });
	await db.insert(media).values({
		id,
		organizationId: orgId,
		key,
		contentType,
		sizeBytes: file.size,
		uploadedBy: userId
	});
	return { id, key, url: `/media/${key}` };
}
