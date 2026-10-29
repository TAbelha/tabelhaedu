import { error } from '@sveltejs/kit';
import { MEDIA_KEY_PATTERN } from '#lib/server/media/validate.js';
import { getPlatform } from '#lib/server/platform.js';
import type { RequestHandler } from './$types';

// Public read: keys are unguessable UUIDs and objects never change once written.
export const GET: RequestHandler = async ({ params }) => {
	if (!MEDIA_KEY_PATTERN.test(params.key)) error(404, 'Arquivo não encontrado');
	const object = await getPlatform().media.get(params.key);
	if (!object) error(404, 'Arquivo não encontrado');

	return new Response(object.body, {
		headers: {
			'Content-Type': object.httpMetadata?.contentType ?? 'application/octet-stream',
			'Cache-Control': 'public, max-age=31536000, immutable',
			'X-Content-Type-Options': 'nosniff'
		}
	});
};
