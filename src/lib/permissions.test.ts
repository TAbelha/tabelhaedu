import { describe, expect, it } from 'vitest';
import { can } from './permissions';

describe('can', () => {
	it('lets an owner manage members', () => {
		expect(can('owner', { member: ['create'] })).toBe(true);
	});

	it('lets a teacher create questions', () => {
		expect(can('teacher', { question: ['create'] })).toBe(true);
	});

	it('does not let a teacher manage members', () => {
		expect(can('teacher', { member: ['create'] })).toBe(false);
	});

	it('does not let a teacher remove enrollments', () => {
		expect(can('teacher', { enrollment: ['delete'] })).toBe(false);
	});

	it('grants the union of comma-separated roles', () => {
		expect(can('admin,teacher', { course: ['delete'] })).toBe(true);
	});

	it('denies everything without a role', () => {
		expect(can(null, { question: ['create'] })).toBe(false);
	});
});
