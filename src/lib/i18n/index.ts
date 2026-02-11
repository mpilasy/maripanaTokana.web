import { register, init, getLocaleFromNavigator } from 'svelte-i18n';

register('en', () => import('./locales/en.json'));
register('mg', () => import('./locales/mg.json'));
register('ar', () => import('./locales/ar.json'));
register('es', () => import('./locales/es.json'));
register('fr', () => import('./locales/fr.json'));
register('hi', () => import('./locales/hi.json'));
register('ne', () => import('./locales/ne.json'));
register('zh', () => import('./locales/zh.json'));

export interface SupportedLocale {
	tag: string;
	flag: string;
	nativeZero?: number; // Unicode code point of native zero digit
	decimalSep?: string; // Override for decimal separator
}

export const SUPPORTED_LOCALES: SupportedLocale[] = [
	{ tag: 'mg', flag: '\uD83C\uDDF2\uD83C\uDDEC', decimalSep: ',' },
	{ tag: 'ar', flag: '\uD83C\uDDF8\uD83C\uDDE6', nativeZero: 0x0660, decimalSep: '\u066B' },
	{ tag: 'en', flag: '\uD83C\uDDEC\uD83C\uDDE7' },
	{ tag: 'es', flag: '\uD83C\uDDEA\uD83C\uDDF8', decimalSep: ',' },
	{ tag: 'fr', flag: '\uD83C\uDDEB\uD83C\uDDF7', decimalSep: ',' },
	{ tag: 'hi', flag: '\uD83C\uDDEE\uD83C\uDDF3', nativeZero: 0x0966 },
	{ tag: 'ne', flag: '\uD83C\uDDF3\uD83C\uDDF5', nativeZero: 0x0966 },
	{ tag: 'zh', flag: '\uD83C\uDDE8\uD83C\uDDF3' },
];

/**
 * Replaces ASCII digits 0-9 with native digits and applies locale-specific
 * decimal separator. Same approach as Android SupportedLocale.localizeDigits().
 */
export function localizeDigits(s: string, locale: SupportedLocale): string {
	let result = s;

	// Replace decimal separator if needed
	if (locale.decimalSep && locale.decimalSep !== '.') {
		result = result.replace(/\./g, locale.decimalSep);
	}

	// Replace digits with native script if needed
	const nativeZero = locale.nativeZero;
	if (nativeZero != null) {
		let out = '';
		for (const c of result) {
			const code = c.charCodeAt(0);
			if (code >= 0x30 && code <= 0x39) {
				out += String.fromCodePoint(nativeZero + (code - 0x30));
			} else {
				out += c;
			}
		}
		result = out;
	}

	return result;
}

export function initI18n(savedLocaleTag?: string) {
	const fallback = 'mg';
	const initialLocale = savedLocaleTag || getLocaleFromNavigator()?.split('-')[0] || fallback;
	// Only use a supported locale
	const supported = SUPPORTED_LOCALES.find((l) => l.tag === initialLocale);

	init({
		fallbackLocale: fallback,
		initialLocale: supported ? supported.tag : fallback,
	});
}
