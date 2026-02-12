import { register, init, getLocaleFromNavigator } from 'svelte-i18n';
export { SUPPORTED_LOCALES, localizeDigits } from './locales';
export type { SupportedLocale } from './locales';
import { SUPPORTED_LOCALES } from './locales';

register('en', () => import('./locales/en.json'));
register('mg', () => import('./locales/mg.json'));
register('ar', () => import('./locales/ar.json'));
register('es', () => import('./locales/es.json'));
register('fr', () => import('./locales/fr.json'));
register('hi', () => import('./locales/hi.json'));
register('ne', () => import('./locales/ne.json'));
register('zh', () => import('./locales/zh.json'));

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
