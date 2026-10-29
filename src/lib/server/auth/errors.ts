const MESSAGES: Record<string, string> = {
	USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION: 'Esta pessoa já faz parte da equipe.',
	USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION: 'Já existe um convite pendente para este e-mail.',
	ORGANIZATION_ALREADY_EXISTS: 'Já existe uma instituição com este identificador.',
	ORGANIZATION_SLUG_ALREADY_TAKEN: 'Já existe uma instituição com este identificador.',
	INVITATION_NOT_FOUND: 'Convite não encontrado ou expirado.',
	YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION: 'Este convite foi enviado para outro e-mail.',
	MEMBER_NOT_FOUND: 'Membro não encontrado.',
	YOU_CANNOT_LEAVE_THE_ORGANIZATION_AS_THE_ONLY_OWNER:
		'A instituição precisa de pelo menos um dono.',
	YOU_CANNOT_LEAVE_THE_ORGANIZATION_WITHOUT_AN_OWNER: 'A instituição precisa de pelo menos um dono.'
};

// Better Auth throws APIError with `body.code`; duck-typed so tests don't need the class.
export function authErrorMessage(error: unknown): string {
	const code =
		typeof error === 'object' && error !== null && 'body' in error
			? (error as { body?: { code?: unknown } }).body?.code
			: undefined;
	return (typeof code === 'string' && MESSAGES[code]) || 'Não foi possível concluir a ação.';
}
