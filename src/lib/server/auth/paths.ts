// The organization plugin is only called server-side through auth.api.*; its HTTP routes
// would bypass the app's guards, tenant scoping and input validation.
const BLOCKED_PREFIX = '/api/auth/organization';

export function isBlockedAuthPath(pathname: string): boolean {
	return pathname === BLOCKED_PREFIX || pathname.startsWith(`${BLOCKED_PREFIX}/`);
}
