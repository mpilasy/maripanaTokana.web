<script lang="ts">
	import { _ } from 'svelte-i18n';
	import { localeIndex } from '$lib/stores/preferences';
	import { SUPPORTED_LOCALES } from '$lib/i18n/index';

	interface Props {
		onGranted: () => void;
	}

	let { onGranted }: Props = $props();

	// Detect if geolocation is available (not available in some in-app browsers)
	let geoAvailable = typeof navigator !== 'undefined' && !!navigator.geolocation;
	let geoError = $state<string | null>(null);

	// Find closest supported locale for the browser's language
	function findBrowserLocaleTag(): string | null {
		if (typeof navigator === 'undefined') return null;
		const lang = navigator.language.split('-')[0].toLowerCase();
		return SUPPORTED_LOCALES.find(l => l.tag === lang)?.tag ?? null;
	}

	const browserLocaleTag = findBrowserLocaleTag();
	let browserStrings = $state<Record<string, string> | null>(null);

	// Load browser locale strings
	if (browserLocaleTag) {
		const loaders: Record<string, () => Promise<{ default: Record<string, string> }>> = {
			en: () => import('$lib/i18n/locales/en.json'),
			mg: () => import('$lib/i18n/locales/mg.json'),
			ar: () => import('$lib/i18n/locales/ar.json'),
			es: () => import('$lib/i18n/locales/es.json'),
			fr: () => import('$lib/i18n/locales/fr.json'),
			hi: () => import('$lib/i18n/locales/hi.json'),
			ne: () => import('$lib/i18n/locales/ne.json'),
			zh: () => import('$lib/i18n/locales/zh.json'),
		};
		loaders[browserLocaleTag]?.().then(mod => browserStrings = mod.default);
	}

	// Show secondary text when browser language differs from app language
	let showSecondary = $derived(
		browserLocaleTag != null &&
		browserLocaleTag !== SUPPORTED_LOCALES[$localeIndex]?.tag &&
		browserStrings != null
	);

	function requestPermission() {
		if (!navigator.geolocation) return;
		geoError = null;
		navigator.geolocation.getCurrentPosition(
			() => onGranted(),
			(err) => {
				console.error('Geolocation error:', err);
				if (err.code === err.PERMISSION_DENIED) {
					geoError = 'permission_denied';
				} else if (err.code === err.POSITION_UNAVAILABLE) {
					geoError = 'position_unavailable';
				} else {
					geoError = 'geo_timeout';
				}
			},
			{ enableHighAccuracy: true, timeout: 10000 }
		);
	}

	function openInBrowser() {
		// Try to force open in system browser
		window.open(window.location.href, '_system') ||
		window.open(window.location.href, '_blank');
	}
</script>

<div class="permission-screen">
	<h2>{$_('permission_title')}</h2>
	<p>{$_('permission_message')}</p>

	{#if showSecondary && browserStrings}
		<div class="secondary-block">
			<h3>{browserStrings.permission_title}</h3>
			<p>{browserStrings.permission_message}</p>
		</div>
	{/if}

	{#if geoError}
		<p class="geo-error">{$_(geoError)}</p>
	{/if}

	{#if geoAvailable}
		<button onclick={requestPermission}>{$_('grant_permission')}</button>
	{/if}

	<button class="open-browser-btn" class:prominent={geoError != null || !geoAvailable} onclick={openInBrowser}>
		{$_('open_in_browser')}
	</button>
</div>

<style>
	.permission-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 32px;
		text-align: center;
		position: relative;
		z-index: 1;
	}

	h2 {
		font-family: var(--font-display);
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 16px;
	}

	p {
		color: rgba(255,255,255,0.7);
		margin-bottom: 24px;
		padding: 0 16px;
		line-height: 1.5;
	}

	.secondary-block {
		margin-bottom: 24px;
		opacity: 0.45;
	}

	.secondary-block h3 {
		font-family: var(--font-display);
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 8px;
	}

	.secondary-block p {
		font-size: 13px;
		margin-bottom: 0;
		line-height: 1.4;
	}

	button {
		padding: 14px 36px;
		background: rgba(255,255,255,0.15);
		color: white;
		border: 1px solid rgba(255,255,255,0.3);
		border-radius: 12px;
		font-size: 16px;
		cursor: pointer;
		transition: background 0.2s;
	}

	button:hover {
		background: rgba(255,255,255,0.25);
	}

	.geo-error {
		color: rgba(255,180,180,0.9);
		font-size: 14px;
		margin-bottom: 16px;
		padding: 0 16px;
	}

	.open-browser-btn {
		margin-top: 12px;
		background: none;
		border: none;
		color: rgba(255,255,255,0.4);
		font-size: 13px;
		text-decoration: underline;
		padding: 8px 16px;
	}

	.open-browser-btn:hover {
		color: rgba(255,255,255,0.6);
	}

	.open-browser-btn.prominent {
		margin-top: 16px;
		padding: 14px 36px;
		background: rgba(255,255,255,0.15);
		color: white;
		border: 1px solid rgba(255,255,255,0.3);
		border-radius: 12px;
		font-size: 16px;
		text-decoration: none;
	}

	.open-browser-btn.prominent:hover {
		background: rgba(255,255,255,0.25);
		color: white;
	}
</style>
