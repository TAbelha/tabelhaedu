export type Access = { memberRole: string | null; isPlatformAdmin: boolean };

// Platform admin status depends only on the user; member role needs both a user and an org.
export async function resolveAccess(
	ctx: { orgId: string | null; user: { id: string; email: string } | null },
	platformAdmins: string[],
	lookupRole: (orgId: string, userId: string) => Promise<string | null>
): Promise<Access> {
	if (!ctx.user) return { memberRole: null, isPlatformAdmin: false };
	return {
		memberRole: ctx.orgId ? await lookupRole(ctx.orgId, ctx.user.id) : null,
		isPlatformAdmin: platformAdmins.includes(ctx.user.email.toLowerCase())
	};
}
