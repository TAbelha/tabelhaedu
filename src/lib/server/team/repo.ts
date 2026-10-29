import { and, asc, eq, gt } from 'drizzle-orm';
import type { Db } from '../db/index';
import { invitation, member, user } from '../db/schema/index';
import { NotFoundError } from '../errors';

export async function listMembers(db: Db, orgId: string) {
	return db
		.select({
			id: member.id,
			userId: member.userId,
			name: user.name,
			email: user.email,
			role: member.role
		})
		.from(member)
		.innerJoin(user, eq(user.id, member.userId))
		.where(eq(member.organizationId, orgId))
		.orderBy(asc(user.name));
}

export async function listPendingInvitations(db: Db, orgId: string, now = new Date()) {
	return db
		.select({
			id: invitation.id,
			email: invitation.email,
			role: invitation.role,
			expiresAt: invitation.expiresAt
		})
		.from(invitation)
		.where(
			and(
				eq(invitation.organizationId, orgId),
				eq(invitation.status, 'pending'),
				gt(invitation.expiresAt, now)
			)
		)
		.orderBy(asc(invitation.createdAt));
}

export async function getPendingInvitation(db: Db, orgId: string, id: string, now = new Date()) {
	const [row] = await db
		.select({ id: invitation.id, email: invitation.email, role: invitation.role })
		.from(invitation)
		.where(
			and(
				eq(invitation.id, id),
				eq(invitation.organizationId, orgId),
				eq(invitation.status, 'pending'),
				gt(invitation.expiresAt, now)
			)
		)
		.limit(1);
	if (!row) throw new NotFoundError();
	return row;
}
