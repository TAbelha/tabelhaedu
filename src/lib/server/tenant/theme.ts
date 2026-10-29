import type { OrgContext, OrgSettings } from './resolve';

const RADIUS_STEPS = new Set(['0', '0.25rem', '0.5rem', '0.75rem', '1rem']);
const PLATFORM_NAME = 'tabelhaedu';

export function isHexColor(value: string): boolean {
	return /^#[0-9a-fA-F]{6}$/.test(value);
}

function channel(hex: string, offset: number): number {
	const c = parseInt(hex.slice(offset, offset + 2), 16) / 255;
	return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function contrast(a: number, b: number): number {
	return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const NEAR_BLACK = '#0a0a0a';
const NEAR_BLACK_LUMINANCE = 0.0033;

// Picks whichever text color has the higher WCAG contrast ratio on the given background.
export function foregroundFor(hex: string): '#ffffff' | '#0a0a0a' {
	const luminance = 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);
	return contrast(luminance, 1) >= contrast(luminance, NEAR_BLACK_LUMINANCE)
		? '#ffffff'
		: NEAR_BLACK;
}

// Only validated values reach the output, so the CSS can be inlined in <head> safely.
export function buildThemeCss(s: OrgSettings): string {
	const vars: string[] = [];
	if (s.primaryColor && isHexColor(s.primaryColor)) {
		const fg = foregroundFor(s.primaryColor);
		vars.push(
			`--primary: ${s.primaryColor}`,
			`--primary-foreground: ${fg}`,
			`--ring: ${s.primaryColor}`,
			`--sidebar-primary: ${s.primaryColor}`,
			`--sidebar-primary-foreground: ${fg}`
		);
	}
	if (s.accentColor && isHexColor(s.accentColor)) {
		vars.push(`--accent: ${s.accentColor}`, `--accent-foreground: ${foregroundFor(s.accentColor)}`);
	}
	if (s.radius && RADIUS_STEPS.has(s.radius)) {
		vars.push(`--radius: ${s.radius}`);
	}
	if (vars.length === 0) return '';
	// html:root / html.dark outrank the stylesheet's :root / .dark regardless of load order.
	return `html:root, html.dark { ${vars.join('; ')}; }`;
}

function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}

// Markup for the %tabelha.head% placeholder: org title fallback plus theme overrides.
export function orgHead(org: OrgContext | null): string {
	if (!org) return `<title>${PLATFORM_NAME}</title>`;
	const css = buildThemeCss(org.settings);
	const style = css ? `<style id="org-theme">${css}</style>` : '';
	return `<title>${escapeHtml(org.name)}</title>${style}`;
}
