import { getPlatform } from '../platform';
import { createAuth, type Auth } from './index';

let auth: Auth | undefined;

// One Better Auth instance per isolate; bindings and config don't change between requests.
export function getAuth(): Auth {
	const { d1, cfg, authSecret } = getPlatform();
	auth ??= createAuth(d1, { ...cfg, secret: authSecret });
	return auth;
}
