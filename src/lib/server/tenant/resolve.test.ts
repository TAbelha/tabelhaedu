import { beforeEach, describe, expect, it } from 'vitest';
import type { Db } from '../db/index';
import { createTestDb } from '../testing/db';
import { insertOrg } from '../testing/fixtures';
import { addDomain } from './repo';
import { normalizeHost, resolveOrg } from './resolve';

describe('normalizeHost', () => {
	it('lowercases and drops the port', () => {
		expect(normalizeHost('Cursinho.Example.com:443')).toBe('cursinho.example.com');
	});
});

describe('resolveOrg', () => {
	let db: Db;
	let cursinho: string;

	beforeEach(async () => {
		db = await createTestDb();
		cursinho = await insertOrg(db, 'cursinho', 'Cursinho');
		await insertOrg(db, 'escola', 'Escola');
		await addDomain(db, cursinho, 'cursinho.example.com');
	});

	it('finds the org by exact host', async () => {
		const org = await resolveOrg(db, 'cursinho.example.com', null);
		expect(org?.slug).toBe('cursinho');
		expect(org?.settings.timezone).toBe('America/Sao_Paulo');
	});

	it('normalizes case and port before matching', async () => {
		const org = await resolveOrg(db, 'Cursinho.Example.com:443', null);
		expect(org?.id).toBe(cursinho);
	});

	it('falls back to the default org for an unknown host', async () => {
		const org = await resolveOrg(db, 'unknown.example.com', 'escola');
		expect(org?.slug).toBe('escola');
	});

	it('returns null for an unknown host without a default', async () => {
		expect(await resolveOrg(db, 'unknown.example.com', null)).toBeNull();
	});

	it('returns null when the default slug does not exist', async () => {
		expect(await resolveOrg(db, 'unknown.example.com', 'missing')).toBeNull();
	});
});
