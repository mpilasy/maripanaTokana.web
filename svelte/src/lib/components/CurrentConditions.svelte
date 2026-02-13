<script lang="ts">
	import { _ } from 'svelte-i18n';
	import type { WeatherData } from '$shared/domain/weatherData';
	import DetailCard from './DetailCard.svelte';
	import DualUnitText from './DualUnitText.svelte';

	interface Props {
		data: WeatherData;
		metricPrimary: boolean;
		loc: (s: string) => string;
		onToggleUnits: () => void;
	}

	let { data, metricPrimary, loc, onToggleUnits }: Props = $props();

	function formatTime(epochSec: number): string {
		const d = new Date(epochSec * 1000);
		return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
	}

	function getCardinalDirection(deg: number): string {
		const dirs: string[] = $_('cardinal_directions') as unknown as string[];
		if (!Array.isArray(dirs)) return '';
		const idx = ((deg % 360 + 360) % 360 * 16 / 360) % 16;
		return dirs[Math.round(idx)] ?? '';
	}

	function getUvLabel(uv: number): string {
		const labels: string[] = $_('uv_labels') as unknown as string[];
		if (!Array.isArray(labels)) return '';
		if (uv < 3) return labels[0];
		if (uv < 6) return labels[1];
		if (uv < 8) return labels[2];
		if (uv < 11) return labels[3];
		return labels[4];
	}

	function visibilityDisplay(meters: number, metric: boolean): [string, string] {
		const km = (meters / 1000).toFixed(1);
		const mi = (meters / 1609.34).toFixed(2);
		return metric
			? [`${km} km`, `${mi} mi`]
			: [`${mi} mi`, `${km} km`];
	}

	let tempDual = $derived(data.temperature.displayDual(metricPrimary));
	let feelsLikeDual = $derived(data.feelsLike.displayDual(metricPrimary));
	let minDual = $derived(data.tempMin.displayDual(metricPrimary));
	let maxDual = $derived(data.tempMax.displayDual(metricPrimary));
	let windDual = $derived(data.windSpeed.displayDual(metricPrimary));
	let gustDual = $derived(data.windGust?.displayDual(metricPrimary));
	let pressDual = $derived(data.pressure.displayDual(metricPrimary));
	let dewDual = $derived(data.dewPoint.displayDual(metricPrimary));
	let visDual = $derived(visibilityDisplay(data.visibility, metricPrimary));
</script>

<div class="conditions-grid">
	<!-- Temperature Now + Feels Like -->
	<div class="detail-card temp-now-card">
		<span class="card-title">{$_('detail_temperature')}</span>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span class="temp-now-values" onclick={onToggleUnits}>
			<span class="card-value">{loc(tempDual[0])}</span>
			<span class="temp-now-secondary">{loc(tempDual[1])}</span>
		</span>
		<span class="feels-label">{$_('feels_like')}</span>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span class="feels-values" onclick={onToggleUnits}>
			<span class="feels-primary">{loc(feelsLikeDual[0])}</span>
			<span class="feels-secondary">{loc(feelsLikeDual[1])}</span>
		</span>
	</div>
	<!-- Precipitation -->
	{#if data.snow}
		{@const [snowP, snowS] = data.snow.displayDual(metricPrimary)}
		<DetailCard
			title={$_('detail_precipitation')}
			value={"\u2744\uFE0F " + loc(snowP)}
			secondaryValue={loc(snowS)}
			{onToggleUnits}
		/>
	{:else if data.rain}
		{@const [rainP, rainS] = data.rain.displayDual(metricPrimary)}
		<DetailCard
			title={$_('detail_precipitation')}
			value={"\uD83C\uDF27\uFE0F " + loc(rainP)}
			secondaryValue={loc(rainS)}
			{onToggleUnits}
		/>
	{:else}
		<DetailCard
			title={$_('detail_precipitation')}
			value={$_('no_precip')}
		/>
	{/if}

	<DetailCard
		title={"\u2193 " + $_('detail_min_temp')}
		value={loc(minDual[0])}
		secondaryValue={loc(minDual[1])}
		{onToggleUnits}
	/>
	<DetailCard
		title={"\u2191 " + $_('detail_max_temp')}
		value={loc(maxDual[0])}
		secondaryValue={loc(maxDual[1])}
		{onToggleUnits}
	/>

	<DetailCard
		title={$_('detail_wind')}
		value={loc(windDual[0])}
		secondaryValue={loc(windDual[1])}
		subtitle={loc(`${getCardinalDirection(data.windDeg)} (${data.windDeg}°)`)}
		{onToggleUnits}
	/>
	{#if gustDual}
		<DetailCard
			title={$_('detail_wind_gust')}
			value={loc(gustDual[0])}
			secondaryValue={loc(gustDual[1])}
			{onToggleUnits}
		/>
	{:else}
		<div class="detail-card-placeholder"></div>
	{/if}

	<DetailCard
		title={$_('detail_pressure')}
		value={loc(pressDual[0])}
		secondaryValue={loc(pressDual[1])}
		{onToggleUnits}
	/>
	<!-- Humidity + Dew point combined card -->
	<div class="detail-card humidity-card">
		<span class="card-title">{$_('detail_humidity')}</span>
		<span class="card-value">{loc(`${data.humidity}%`)}</span>
		<span class="dew-label">{$_('detail_dewpoint')}</span>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span class="dew-values" onclick={onToggleUnits}>
			<span class="dew-primary">{loc(dewDual[0])}</span>
			<span class="dew-secondary">{loc(dewDual[1])}</span>
		</span>
	</div>

	<DetailCard
		title={$_('detail_uv_index')}
		value={loc(data.uvIndex.toFixed(1))}
		subtitle={getUvLabel(data.uvIndex)}
	/>
	<DetailCard
		title={$_('detail_visibility')}
		value={loc(visDual[0])}
		secondaryValue={loc(visDual[1])}
		{onToggleUnits}
	/>

	<DetailCard
		title={$_('detail_sunrise')}
		value={loc(formatTime(data.sunrise))}
	/>
	<DetailCard
		title={$_('detail_sunset')}
		value={loc(formatTime(data.sunset))}
	/>
</div>

<style>
	.conditions-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-auto-rows: 1fr;
		gap: 16px;
	}

	.detail-card-placeholder {
	}

	.temp-now-card {
		background: rgba(42, 31, 165, 0.6);
		border-radius: 16px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		flex: 1;
	}

	.temp-now-values {
		cursor: pointer;
	}

	.temp-now-secondary {
		font-family: var(--font-display);
		font-size: 14px;
		color: rgba(255,255,255,0.55);
		margin-left: 4px;
	}

	.feels-label {
		font-size: 12px;
		color: rgba(255,255,255,0.5);
	}

	.feels-values {
		cursor: pointer;
	}

	.feels-primary {
		font-family: var(--font-display);
		font-size: 13px;
		font-weight: 700;
		color: white;
	}

	.feels-secondary {
		font-family: var(--font-display);
		font-size: 12px;
		color: rgba(255,255,255,0.55);
		margin-left: 4px;
	}

	.humidity-card {
		background: rgba(42, 31, 165, 0.6);
		border-radius: 16px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		flex: 1;
	}

	.card-title {
		font-size: 14px;
		color: rgba(255,255,255,0.7);
	}

	.card-value {
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		color: white;
		font-feature-settings: var(--font-features);
	}

	.dew-label {
		font-size: 12px;
		color: rgba(255,255,255,0.5);
	}

	.dew-values {
		cursor: pointer;
	}

	.dew-primary {
		font-family: var(--font-display);
		font-size: 13px;
		font-weight: 700;
		color: white;
	}

	.dew-secondary {
		font-family: var(--font-display);
		font-size: 12px;
		color: rgba(255,255,255,0.55);
		margin-left: 4px;
	}
</style>
