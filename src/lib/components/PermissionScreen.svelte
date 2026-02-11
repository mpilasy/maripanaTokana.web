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

	let copied = $state(false);

	function requestPermission() {
		if (!navigator.geolocation) return;
		geoError = null;

		// Manual fallback timeout — in some in-app browsers, getCurrentPosition
		// never calls either callback, so the browser's own timeout never fires
		let settled = false;
		const fallbackTimer = setTimeout(() => {
			if (!settled) {
				settled = true;
				geoError = 'geo_timeout';
			}
		}, 12000);

		navigator.geolocation.getCurrentPosition(
			() => {
				if (settled) return;
				settled = true;
				clearTimeout(fallbackTimer);
				onGranted();
			},
			(err) => {
				if (settled) return;
				settled = true;
				clearTimeout(fallbackTimer);
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

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(window.location.href);
			copied = true;
			setTimeout(() => copied = false, 3000);
		} catch {
			// Fallback: select a temporary input
			const input = document.createElement('input');
			input.value = window.location.href;
			document.body.appendChild(input);
			input.select();
			document.execCommand('copy');
			document.body.removeChild(input);
			copied = true;
			setTimeout(() => copied = false, 3000);
		}
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
		<button onclick={requestPermission}>
			{$_('grant_permission')}
			{#if showSecondary && browserStrings}
				<span class="btn-secondary">{browserStrings.grant_permission}</span>
			{/if}
		</button>
	{/if}

	<button class="copy-link-btn" class:prominent={geoError != null || !geoAvailable} onclick={copyLink}>
		{#if copied}
			{$_('link_copied')}
		{:else}
			{$_('copy_link')}
			{#if showSecondary && browserStrings}
				<span class="btn-secondary">{browserStrings.copy_link}</span>
			{/if}
		{/if}
	</button>
	<p class="copy-hint">
		{$_('copy_link_hint')}
		{#if showSecondary && browserStrings}
			<span class="hint-secondary">{browserStrings.copy_link_hint}</span>
		{/if}
	</p>
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
		padding: 16px 48px;
		background: white;
		color: #0E0B3D;
		border: none;
		border-radius: 14px;
		font-size: 18px;
		font-weight: 700;
		cursor: pointer;
		transition: background 0.2s, transform 0.1s;
		box-shadow: 0 4px 20px rgba(255,255,255,0.25);
	}

	button:hover {
		background: rgba(255,255,255,0.9);
	}

	button:active {
		transform: scale(0.97);
	}

	.btn-secondary {
		display: block;
		font-size: 11px;
		opacity: 0.4;
		margin-top: 4px;
		font-weight: 400;
		color: inherit;
	}

	.hint-secondary {
		display: block;
		opacity: 0.7;
		margin-top: 2px;
	}

	.geo-error {
		color: rgba(255,180,180,0.9);
		font-size: 14px;
		margin-bottom: 16px;
		padding: 0 16px;
	}

	.copy-link-btn {
		margin-top: 12px;
		background: none;
		border: none;
		color: rgba(255,255,255,0.4);
		font-size: 13px;
		text-decoration: underline;
		padding: 8px 16px;
	}

	.copy-link-btn:hover {
		color: rgba(255,255,255,0.6);
	}

	.copy-link-btn.prominent {
		margin-top: 16px;
		padding: 14px 36px;
		background: rgba(255,255,255,0.15);
		color: white;
		border: 1px solid rgba(255,255,255,0.3);
		border-radius: 12px;
		font-size: 16px;
		text-decoration: none;
	}

	.copy-link-btn.prominent:hover {
		background: rgba(255,255,255,0.25);
		color: white;
	}

	.copy-hint {
		font-size: 12px;
		color: rgba(255,255,255,0.35);
		margin-bottom: 0;
		margin-top: 0;
	}
</style>
