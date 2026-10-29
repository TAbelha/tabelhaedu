// D1 rejects statements with more than 100 bound parameters.
export const D1_MAX_PARAMS = 100;

export function chunkRows<T>(
	rows: readonly T[],
	paramsPerRow: number,
	maxParams = D1_MAX_PARAMS
): T[][] {
	if (paramsPerRow < 1 || paramsPerRow > maxParams) {
		throw new RangeError(`paramsPerRow must be between 1 and ${maxParams}, got ${paramsPerRow}`);
	}
	const size = Math.floor(maxParams / paramsPerRow);
	const chunks: T[][] = [];
	for (let i = 0; i < rows.length; i += size) {
		chunks.push(rows.slice(i, i + size));
	}
	return chunks;
}
