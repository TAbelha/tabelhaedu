import { beforeEach, describe, expect, it } from 'vitest';
import type { Db } from '../db/index';
import { invitation, member, user } from '../db/schema/index';
import { createTestDb } from '../testing/db';
import { insertOrg } from '../testing/fixtures';
import { listMembers, listPendingInvitations } from './repo';

describe('team repo', () => {
	let db: Db;
	let orgA: string;
	let orgB: string;

	beforeEach(async () => {
		db = await createTestDb();
		orgA = await insertOrg(db, 'a');
		orgB = await insertOrg(db, 'b');
		const now = new Date();
		await db.insert(user).values([
			{ id: 'u1', name: 'Zélia', email: 'z@example.com', createdAt: now, updatedAt: now },
			{ id: 'u2', name: 'Ana', email: 'a@example.com', createdAt: now, updatedAt: now }
		]);
		await db.insert(member).values([
			{ id: 'm1', organizationId: orgA, userId: 'u1', role: 'owner', createdAt: now },
			{ id: 'm2', organizationId: orgA, userId: 'u2', role: 'teacher', createdAt: now },
			{ id: 'm3', organizationId: orgB, userId: 'u2', role: 'owner', createdAt: now }
		]);
	});

	it('lists the org members by name', async () => {
		expect(await listMembers(db, orgA)).toEqual([
			{ id: 'm2', userId: 'u2', name: 'Ana', email: 'a@example.com', role: 'teacher' },
			{ id: 'm1', userId: 'u1', name: 'Zélia', email: 'z@example.com', role: 'owner' }
		]);
	});

	it('lists only pending, unexpired invitations of the org', async () => {
		const future = new Date(Date.now() + 86_400_000);
		const past = new Date(Date.now() - 1000);
		await db.insert(invitation).values([
			{
				id: 'i1',
				organizationId: orgA,
				email: 'p@example.com',
				role: 'teacher',
				status: 'pending',
				expiresAt: future,
				inviterId: 'u1',
				createdAt: new Date()
			},
			{
				id: 'i2',
				organizationId: orgA,
				email: 'q@example.com',
				role: 'teacher',
				status: 'accepted',
				expiresAt: future,
				inviterId: 'u1',
				createdAt: new Date()
			},
			{
				id: 'i3',
				organizationId: orgA,
				email: 'r@example.com',
				role: 'teacher',
				status: 'pending',
				expiresAt: past,
				inviterId: 'u1',
				createdAt: new Date()
			},
			{
				id: 'i4',
				organizationId: orgB,
				email: 's@example.com',
				role: 'teacher',
				status: 'pending',
				expiresAt: future,
				inviterId: 'u2',
				createdAt: new Date()
			}
		]);
		const pending = await listPendingInvitations(db, orgA);
		expect(pending.map((i) => i.id)).toEqual(['i1']);
		expect(pending[0]).toMatchObject({ email: 'p@example.com', role: 'teacher' });
	});
});
