import { describe, expect, it } from 'vitest';
import { chunkRows } from './chunk';

describe('chunkRows', () => {
	it('splits rows so each chunk stays within the parameter limit', () => {
		const rows = Array.from({ length: 40 }, (_, i) => i);
		const chunks = chunkRows(rows, 6);
		expect(chunks.map((c) => c.length)).toEqual([16, 16, 8]);
		expect(chunks.flat()).toEqual(rows);
	});

	it('returns no chunks for no rows', () => {
		expect(chunkRows([], 6)).toEqual([]);
	});

	it('rejects a row that alone exceeds the limit', () => {
		expect(() => chunkRows([1], 101)).toThrow();
	});
});
