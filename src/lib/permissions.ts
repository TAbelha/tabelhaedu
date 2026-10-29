// Loaded by the Better Auth CLI outside Vite: keep imports relative or from packages.
import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements, ownerAc } from 'better-auth/plugins/organization/access';

export const statement = {
	...defaultStatements,
	course: ['create', 'update', 'delete'],
	curriculum: ['create', 'update', 'delete'],
	schedule: ['update'],
	question: ['create', 'update', 'delete'],
	exam: ['create', 'update', 'publish', 'delete'],
	enrollment: ['create', 'update', 'delete'],
	results: ['read', 'release']
} as const;

export const ac = createAccessControl(statement);

// Content permissions shared by every staff role.
const teaching = {
	curriculum: ['create', 'update', 'delete'],
	schedule: ['update'],
	question: ['create', 'update', 'delete'],
	exam: ['create', 'update', 'publish'],
	results: ['read', 'release']
} as const;

// Course and roster management, on top of teaching, for owners and admins.
const managing = {
	...teaching,
	course: ['create', 'update', 'delete'],
	enrollment: ['create', 'update', 'delete'],
	exam: ['create', 'update', 'publish', 'delete']
} as const;

export const roles = {
	owner: ac.newRole({ ...ownerAc.statements, ...managing }),
	admin: ac.newRole({ ...adminAc.statements, ...managing }),
	teacher: ac.newRole({ ...teaching })
};

export type RoleName = keyof typeof roles;

export type Permission = Partial<{
	[K in keyof typeof statement]: readonly (typeof statement)[K][number][];
}>;

function isRoleName(name: string): name is RoleName {
	return Object.hasOwn(roles, name);
}

// A member's role may be a comma-separated list; the result is the union of those roles.
export function can(role: string | null, perm: Permission): boolean {
	if (!role) return false;
	const memberRoles = role
		.split(',')
		.map((r) => r.trim())
		.filter(isRoleName);
	if (memberRoles.length === 0) return false;

	for (const [resource, actions] of Object.entries(perm)) {
		for (const action of actions ?? []) {
			const granted = memberRoles.some(
				(r) => roles[r].authorize({ [resource]: [action] } as never).success
			);
			if (!granted) return false;
		}
	}
	return true;
}
