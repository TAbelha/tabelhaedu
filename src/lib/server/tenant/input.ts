import { z } from 'zod';
import { MEDIA_KEY_PATTERN } from '../media/validate';

const RADIUS_STEPS = ['0', '0.25rem', '0.5rem', '0.75rem', '1rem'] as const;
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$/;
const HOSTNAME_PATTERN =
	/^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/;

// Empty form fields mean "not set".
const blankToNull = (value: unknown) =>
	value === undefined || (typeof value === 'string' && value.trim() === '') ? null : value;

function isTimeZone(value: string): boolean {
	try {
		new Intl.DateTimeFormat('en', { timeZone: value });
		return true;
	} catch {
		return false;
	}
}

const color = z.preprocess(
	blankToNull,
	z
		.string()
		.regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida')
		.transform((value) => value.toLowerCase())
		.nullable()
);

export const orgThemeInput = z.object({
	primaryColor: color,
	accentColor: color,
	radius: z.preprocess(blankToNull, z.enum(RADIUS_STEPS).nullable()),
	timezone: z.string().refine(isTimeZone, 'Fuso horário inválido')
});

const name = z.string().trim().min(1, 'Informe o nome').max(80);

export const orgProfileInput = z.object({
	name,
	logo: z.preprocess(
		blankToNull,
		z
			.string()
			.refine(
				(url) => url.startsWith('/media/') && MEDIA_KEY_PATTERN.test(url.slice('/media/'.length)),
				'Logo inválida'
			)
			.nullable()
	)
});

export const platformOrgInput = z.object({
	name,
	slug: z.string().trim().regex(SLUG_PATTERN, 'Use letras minúsculas, números e hífens'),
	hostname: z.preprocess(
		blankToNull,
		z.string().trim().toLowerCase().regex(HOSTNAME_PATTERN, 'Domínio inválido').nullable()
	)
});

export const domainInput = z.object({
	hostname: z.string().trim().toLowerCase().regex(HOSTNAME_PATTERN, 'Domínio inválido')
});

export const inviteInput = z.object({
	email: z.preprocess(
		(value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
		z.email('E-mail inválido')
	),
	role: z.enum(['teacher', 'admin'])
});
