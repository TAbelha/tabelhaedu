import { beforeEach, describe, expect, it } from 'vitest';
import type { Db } from '../db/index';
import { ConflictError, NotFoundError } from '../errors';
import { createTestDb } from '../testing/db';
import { insertOrg } from '../testing/fixtures';
import { addDomain, removeDomain, updateOrgSettings } from './repo';
import { resolveOrg } from './resolve';

describe('tenant repo', () => {
	let db: Db;
	let orgA: string;
	let orgB: string;

	beforeEach(async () => {
		db = await createTestDb();
		orgA = await insertOrg(db, 'a');
		orgB = await insertOrg(db, 'b');
	});

	it('rejects a hostname already used by another org', async () => {
		await addDomain(db, orgA, 'a.example.com');
		await expect(addDomain(db, orgB, 'A.example.com')).rejects.toSatisfy(
			(e) => e instanceof ConflictError && e.code === 'duplicate'
		);
	});

	it("does not let an org remove another org's domain", async () => {
		await addDomain(db, orgA, 'a.example.com');
		await expect(removeDomain(db, orgB, 'a.example.com')).rejects.toBeInstanceOf(NotFoundError);
		expect((await resolveOrg(db, 'a.example.com', null))?.id).toBe(orgA);
	});

	it('stores settings per org', async () => {
		await updateOrgSettings(db, orgA, { primaryColor: '#1d4ed8' });
		await updateOrgSettings(db, orgA, { radius: '0.5rem' });
		const org = await resolveOrg(db, 'x', 'a');
		expect(org?.settings).toEqual({
			primaryColor: '#1d4ed8',
			accentColor: null,
			radius: '0.5rem',
			timezone: 'America/Sao_Paulo'
		});
	});
});
