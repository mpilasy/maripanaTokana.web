import { useTranslation } from 'react-i18next';
import type { WeatherData } from '$lib/domain/weatherData';
import DetailCard from './DetailCard';

interface CurrentConditionsProps {
	data: WeatherData;
	metricPrimary: boolean;
	loc: (s: string) => string;
	onToggleUnits: () => void;
}

function formatTime(epochSec: number): string {
	const d = new Date(epochSec * 1000);
	return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function getCardinalDirection(deg: number, t: (key: string) => unknown): string {
	const dirs = t('cardinal_directions') as unknown as string[];
	if (!Array.isArray(dirs)) return '';
	const idx = ((deg % 360 + 360) % 360 * 16 / 360) % 16;
	return dirs[Math.round(idx)] ?? '';
}

function getUvLabel(uv: number, t: (key: string) => unknown): string {
	const labels = t('uv_labels') as unknown as string[];
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

export default function CurrentConditions({ data, metricPrimary, loc, onToggleUnits }: CurrentConditionsProps) {
	const { t } = useTranslation();

	const tempDual = data.temperature.displayDual(metricPrimary);
	const feelsLikeDual = data.feelsLike.displayDual(metricPrimary);
	const snowDual = data.snow?.displayDual(metricPrimary);
	const rainDual = data.rain?.displayDual(metricPrimary);
	const minDual = data.tempMin.displayDual(metricPrimary);
	const maxDual = data.tempMax.displayDual(metricPrimary);
	const windDual = data.windSpeed.displayDual(metricPrimary);
	const gustDual = data.windGust?.displayDual(metricPrimary);
	const pressDual = data.pressure.displayDual(metricPrimary);
	const dewDual = data.dewPoint.displayDual(metricPrimary);
	const visDual = visibilityDisplay(data.visibility, metricPrimary);

	return (
		<div className="conditions-grid">
			{/* Temperature Now + Feels Like */}
			<div className="detail-card temp-now-card">
				<span className="detail-card-title">{t('detail_temperature')}</span>
				<span className="temp-now-values" onClick={onToggleUnits}>
					<span className="detail-card-value">{loc(tempDual[0])}</span>
					<span className="temp-now-secondary">{loc(tempDual[1])}</span>
				</span>
				<span className="feels-label">{t('feels_like')}</span>
				<span className="feels-values" onClick={onToggleUnits}>
					<span className="feels-primary">{loc(feelsLikeDual[0])}</span>
					<span className="feels-secondary">{loc(feelsLikeDual[1])}</span>
				</span>
			</div>
			{/* Precipitation */}
			{snowDual ? (
				<DetailCard
					title={t('detail_precipitation')}
					value={"\u2744\uFE0F " + loc(snowDual[0])}
					secondaryValue={loc(snowDual[1])}
					onToggleUnits={onToggleUnits}
				/>
			) : rainDual ? (
				<DetailCard
					title={t('detail_precipitation')}
					value={"\uD83C\uDF27\uFE0F " + loc(rainDual[0])}
					secondaryValue={loc(rainDual[1])}
					onToggleUnits={onToggleUnits}
				/>
			) : (
				<DetailCard
					title={t('detail_precipitation')}
					value={t('no_precip')}
				/>
			)}

			<DetailCard
				title={"\u2193 " + t('detail_min_temp')}
				value={loc(minDual[0])}
				secondaryValue={loc(minDual[1])}
				onToggleUnits={onToggleUnits}
			/>
			<DetailCard
				title={"\u2191 " + t('detail_max_temp')}
				value={loc(maxDual[0])}
				secondaryValue={loc(maxDual[1])}
				onToggleUnits={onToggleUnits}
			/>

			<DetailCard
				title={t('detail_wind')}
				value={loc(windDual[0])}
				secondaryValue={loc(windDual[1])}
				subtitle={loc(`${getCardinalDirection(data.windDeg, t)} (${data.windDeg}°)`)}
				onToggleUnits={onToggleUnits}
			/>
			{gustDual ? (
				<DetailCard
					title={t('detail_wind_gust')}
					value={loc(gustDual[0])}
					secondaryValue={loc(gustDual[1])}
					onToggleUnits={onToggleUnits}
				/>
			) : (
				<div className="detail-card-placeholder" />
			)}

			<DetailCard
				title={t('detail_pressure')}
				value={loc(pressDual[0])}
				secondaryValue={loc(pressDual[1])}
				onToggleUnits={onToggleUnits}
			/>
			{/* Humidity + Dew point combined card */}
			<div className="detail-card humidity-card">
				<span className="detail-card-title">{t('detail_humidity')}</span>
				<span className="detail-card-value">{loc(`${data.humidity}%`)}</span>
				<span className="dew-label">{t('detail_dewpoint')}</span>
				<span className="dew-values" onClick={onToggleUnits}>
					<span className="dew-primary">{loc(dewDual[0])}</span>
					<span className="dew-secondary">{loc(dewDual[1])}</span>
				</span>
			</div>

			<DetailCard
				title={t('detail_uv_index')}
				value={loc(data.uvIndex.toFixed(1))}
				subtitle={getUvLabel(data.uvIndex, t)}
			/>
			<DetailCard
				title={t('detail_visibility')}
				value={loc(visDual[0])}
				secondaryValue={loc(visDual[1])}
				onToggleUnits={onToggleUnits}
			/>

			<DetailCard
				title={t('detail_sunrise')}
				value={loc(formatTime(data.sunrise))}
			/>
			<DetailCard
				title={t('detail_sunset')}
				value={loc(formatTime(data.sunset))}
			/>
		</div>
	);
}
