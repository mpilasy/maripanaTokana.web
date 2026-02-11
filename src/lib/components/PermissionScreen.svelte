<script lang="ts">
	import { _ } from 'svelte-i18n';

	interface Props {
		onGranted: () => void;
	}

	let { onGranted }: Props = $props();

	function requestPermission() {
		navigator.geolocation.getCurrentPosition(
			() => onGranted(),
			(err) => {
				console.error('Geolocation permission denied:', err);
			},
			{ enableHighAccuracy: true }
		);
	}
</script>

<div class="permission-screen">
	<h2>{$_('permission_title')}</h2>
	<p>{$_('permission_message')}</p>
	<button onclick={requestPermission}>{$_('grant_permission')}</button>
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
</style>
