<script lang="ts">
	import { _ } from 'svelte-i18n';
	import type { WeatherData } from '$lib/domain/weatherData';
	import { wmoEmoji, wmoDescriptionKey } from '$lib/api/wmoWeatherCode';
	import DualUnitText from './DualUnitText.svelte';

	interface Props {
		data: WeatherData;
		metricPrimary: boolean;
		loc: (s: string) => string;
		onToggleUnits: () => void;
	}

	let { data, metricPrimary, loc, onToggleUnits }: Props = $props();

	let isNight = $derived(data.timestamp < data.sunrise * 1000 || data.timestamp > data.sunset * 1000);
	let emoji = $derived(wmoEmoji(data.weatherCode, isNight));
	let description = $derived($_( wmoDescriptionKey(data.weatherCode)));
	let tempDual = $derived(data.temperature.displayDualMixed(metricPrimary));
	let feelsLikeDual = $derived(data.feelsLike.displayDual(metricPrimary));
</script>

<div class="hero-card">
	<div class="hero-top">
		<div class="hero-weather">
			<span class="hero-emoji">{emoji}</span>
			<span class="hero-description">{description}</span>
		</div>
		<DualUnitText
			primary={loc(tempDual[0])}
			secondary={loc(tempDual[1])}
			primarySize="48px"
			align="end"
			onClick={onToggleUnits}
		/>
	</div>

	<div class="hero-bottom">
		<div class="hero-feels-like">
			<span class="label">{$_('feels_like')}</span>
			<DualUnitText
				primary={loc(feelsLikeDual[0])}
				secondary={loc(feelsLikeDual[1])}
				onClick={onToggleUnits}
			/>
		</div>
		<div class="hero-precip">
			{#if data.snow}
				{@const [snowP, snowS] = data.snow.displayDual(metricPrimary)}
				<DualUnitText
					primary={"\u2744\uFE0F " + loc(snowP)}
					secondary={loc(snowS)}
					align="end"
					onClick={onToggleUnits}
				/>
			{:else if data.rain}
				{@const [rainP, rainS] = data.rain.displayDual(metricPrimary)}
				<DualUnitText
					primary={"\uD83C\uDF27\uFE0F " + loc(rainP)}
					secondary={loc(rainS)}
					align="end"
					onClick={onToggleUnits}
				/>
			{:else}
				<span class="no-precip">{$_('no_precip')}</span>
			{/if}
		</div>
	</div>

	<div class="copyright">&copy; Orinasa Njarasoa</div>
</div>

<style>
	.hero-card {
		background: rgba(42, 31, 165, 0.8);
		border-radius: 20px;
		padding: 24px;
		margin-bottom: 24px;
	}

	.hero-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}

	.hero-weather {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 1;
	}

	.hero-emoji {
		font-size: 48px;
		line-height: 1;
	}

	.hero-description {
		font-size: 16px;
		color: rgba(255,255,255,0.9);
		text-align: center;
		margin-top: 4px;
	}

	.hero-bottom {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-top: 16px;
	}

	.hero-feels-like {
		flex: 1;
	}

	.label {
		font-size: 14px;
		color: rgba(255,255,255,0.7);
		display: block;
		margin-bottom: 2px;
	}

	.hero-precip {
		text-align: end;
	}

	.no-precip {
		font-size: 14px;
		color: rgba(255,255,255,0.5);
	}

	.copyright {
		text-align: center;
		font-size: 9px;
		color: rgba(255,255,255,0.2);
		margin-top: 7px;
	}
</style>
