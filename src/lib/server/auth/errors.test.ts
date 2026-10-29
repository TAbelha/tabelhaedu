import { describe, expect, it } from 'vitest';
import { authErrorMessage } from './errors';

describe('authErrorMessage', () => {
	it('translates known organization errors', () => {
		const e = { body: { code: 'USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION' } };
		expect(authErrorMessage(e)).toBe('Já existe um convite pendente para este e-mail.');
	});

	it('falls back to a generic message', () => {
		expect(authErrorMessage(new Error('boom'))).toBe('Não foi possível concluir a ação.');
		expect(authErrorMessage({ body: { code: 'SOMETHING_ELSE' } })).toBe(
			'Não foi possível concluir a ação.'
		);
	});
});
