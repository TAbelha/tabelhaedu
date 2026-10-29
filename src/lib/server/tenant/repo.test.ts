import { beforeEach, describe, expect, it } from 'vitest';
import type { Db } from '../db/index';
import { ConflictError, NotFoundError } from '../errors';
import { createTestDb } from '../testing/db';
import { insertOrg } from '../testing/fixtures';
import {
	addDomain,
	listDomains,
	listOrganizations,
	removeDomain,
	updateOrgProfile,
	updateOrgSettings
} from './repo';
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

describe('org profile and domains', () => {
	let db: Db;
	let orgA: string;
	let orgB: string;

	beforeEach(async () => {
		db = await createTestDb();
		orgA = await insertOrg(db, 'a');
		orgB = await insertOrg(db, 'b');
	});

	it('lists only the org domains, the first one primary', async () => {
		await addDomain(db, orgA, 'a.example.com');
		await addDomain(db, orgA, 'b.a.example.com');
		await addDomain(db, orgB, 'b.example.com');
		expect(await listDomains(db, orgA)).toEqual([
			{ hostname: 'a.example.com', isPrimary: true },
			{ hostname: 'b.a.example.com', isPrimary: false }
		]);
	});

	it('updates name and logo of the given org only', async () => {
		await updateOrgProfile(db, orgA, { name: 'Novo nome', logo: '/media/x.png' });
		expect((await resolveOrg(db, 'x', 'a'))?.name).toBe('Novo nome');
		expect((await resolveOrg(db, 'x', 'a'))?.logo).toBe('/media/x.png');
		expect((await resolveOrg(db, 'x', 'b'))?.name).toBe('b');
	});
});

describe('listOrganizations', () => {
	it('lists every org by name with its primary domain', async () => {
		const db = await createTestDb();
		const b = await insertOrg(db, 'b', 'Beta');
		await insertOrg(db, 'a', 'Alfa');
		await addDomain(db, b, 'beta.example.com');
		await addDomain(db, b, 'www.beta.example.com');
		expect(await listOrganizations(db)).toEqual([
			{ id: 'org-a', name: 'Alfa', slug: 'a', primaryDomain: null },
			{ id: 'org-b', name: 'Beta', slug: 'b', primaryDomain: 'beta.example.com' }
		]);
	});
});
