import { error, json } from '@sveltejs/kit';
import { requireStaff } from '#lib/server/guards.js';
import { storeMedia } from '#lib/server/media/repo.js';
import { validateUpload } from '#lib/server/media/validate.js';
import { getPlatform } from '#lib/server/platform.js';
import type { RequestHandler } from './$types';

const MESSAGES = {
	type: 'Formato não suportado (use PNG, JPEG, WebP ou GIF)',
	size: 'Arquivo maior que 5 MB'
};

export const POST: RequestHandler = async ({ locals, request }) => {
	const { org, user } = requireStaff(locals);
	const file = (await request.formData()).get('file');
	if (!(file instanceof File)) error(400, 'Envie um arquivo no campo "file"');

	const check = validateUpload(file);
	if (!check.ok) error(400, MESSAGES[check.reason]);

	const { db, media } = getPlatform();
	return json(await storeMedia(db, media, org.id, user.id, file), { status: 201 });
};
