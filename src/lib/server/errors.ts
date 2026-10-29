// Thrown when a row does not exist or belongs to another organization; routes map it to 404.
export class NotFoundError extends Error {
	constructor(message = 'Not found') {
		super(message);
		this.name = 'NotFoundError';
	}
}

export type ConflictCode = 'in_use' | 'cycle' | 'duplicate' | 'locked' | 'invalid';

export class ConflictError extends Error {
	readonly code: ConflictCode;

	constructor(code: ConflictCode, message: string = code) {
		super(message);
		this.name = 'ConflictError';
		this.code = code;
	}
}
