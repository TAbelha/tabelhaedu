import { createAuthClient } from 'better-auth/svelte';

// Organization operations run server-side only (their HTTP routes are blocked in hooks).
export const authClient = createAuthClient();
