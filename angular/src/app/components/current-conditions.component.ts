import { Component, input, output, inject, computed } from '@angular/core';
import type { WeatherData } from '$lib/domain/weatherData';
import { I18nService } from '../services/i18n.service';
import { DetailCardComponent } from './detail-card.component';

@Component({
	selector: 'app-current-conditions',
	standalone: true,
	imports: [DetailCardComponent],
	template: `
		<div class="conditions-grid">
			<div class="temp-now-card">
				<span class="card-title">{{ i18n.t('detail_temperature') }}</span>
				<span class="temp-now-values" (click)="onToggleUnits.emit()">
					<span class="card-value">{{ tempDual()[0] }}</span>
					<span class="temp-now-secondary">{{ tempDual()[1] }}</span>
				</span>
				<span class="feels-label">{{ i18n.t('feels_like') }}</span>
				<span class="feels-values" (click)="onToggleUnits.emit()">
					<span class="feels-primary">{{ feelsLikeDual()[0] }}</span>
					<span class="feels-secondary">{{ feelsLikeDual()[1] }}</span>
				</span>
			</div>
			@if (snowDual()) {
				<app-detail-card [title]="i18n.t('detail_precipitation')" [value]="'\\u2744\\uFE0F ' + snowDual()![0]" [secondaryValue]="snowDual()![1]" (onToggleUnits)="onToggleUnits.emit()" />
			} @else if (rainDual()) {
				<app-detail-card [title]="i18n.t('detail_precipitation')" [value]="'\\uD83C\\uDF27\\uFE0F ' + rainDual()![0]" [secondaryValue]="rainDual()![1]" (onToggleUnits)="onToggleUnits.emit()" />
			} @else {
				<app-detail-card [title]="i18n.t('detail_precipitation')" [value]="i18n.t('no_precip')" />
			}

			<app-detail-card [title]="'↓ ' + i18n.t('detail_min_temp')" [value]="minDual()[0]" [secondaryValue]="minDual()[1]" (onToggleUnits)="onToggleUnits.emit()" />
			<app-detail-card [title]="'↑ ' + i18n.t('detail_max_temp')" [value]="maxDual()[0]" [secondaryValue]="maxDual()[1]" (onToggleUnits)="onToggleUnits.emit()" />

			<app-detail-card [title]="i18n.t('detail_wind')" [value]="windDual()[0]" [secondaryValue]="windDual()[1]" [subtitle]="windSubtitle()" (onToggleUnits)="onToggleUnits.emit()" />
			@if (gustDual()) {
				<app-detail-card [title]="i18n.t('detail_wind_gust')" [value]="gustDual()![0]" [secondaryValue]="gustDual()![1]" (onToggleUnits)="onToggleUnits.emit()" />
			} @else {
				<div class="placeholder"></div>
			}

			<app-detail-card [title]="i18n.t('detail_pressure')" [value]="pressDual()[0]" [secondaryValue]="pressDual()[1]" (onToggleUnits)="onToggleUnits.emit()" />
			<div class="humidity-card">
				<span class="card-title">{{ i18n.t('detail_humidity') }}</span>
				<span class="card-value">{{ loc()(data().humidity + '%') }}</span>
				<span class="dew-label">{{ i18n.t('detail_dewpoint') }}</span>
				<span class="dew-values" (click)="onToggleUnits.emit()">
					<span class="dew-primary">{{ dewDual()[0] }}</span>
					<span class="dew-secondary">{{ dewDual()[1] }}</span>
				</span>
			</div>

			<app-detail-card [title]="i18n.t('detail_uv_index')" [value]="loc()(data().uvIndex.toFixed(1))" [subtitle]="uvLabel()" />
			<app-detail-card [title]="i18n.t('detail_visibility')" [value]="visDual()[0]" [secondaryValue]="visDual()[1]" (onToggleUnits)="onToggleUnits.emit()" />

			<app-detail-card [title]="i18n.t('detail_sunrise')" [value]="loc()(formatTime(data().sunrise))" />
			<app-detail-card [title]="i18n.t('detail_sunset')" [value]="loc()(formatTime(data().sunset))" />
		</div>
	`,
	styles: `
		.conditions-grid { display: grid; grid-template-columns: 1fr 1fr; grid-auto-rows: 1fr; gap: 16px; }
		.placeholder { }
		.temp-now-card { background: rgba(42,31,165,0.6); border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 8px; }
		.temp-now-values { cursor: pointer; }
		.temp-now-secondary { font-family: var(--font-display); font-size: 14px; color: rgba(255,255,255,0.55); margin-left: 4px; }
		.feels-label { font-size: 12px; color: rgba(255,255,255,0.5); }
		.feels-values { cursor: pointer; }
		.feels-primary { font-family: var(--font-display); font-size: 13px; font-weight: 700; color: white; }
		.feels-secondary { font-family: var(--font-display); font-size: 12px; color: rgba(255,255,255,0.55); margin-left: 4px; }
		.humidity-card { background: rgba(42,31,165,0.6); border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 8px; }
		.card-title { font-size: 14px; color: rgba(255,255,255,0.7); }
		.card-value { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: white; font-feature-settings: var(--font-features); }
		.dew-label { font-size: 12px; color: rgba(255,255,255,0.5); }
		.dew-values { cursor: pointer; }
		.dew-primary { font-family: var(--font-display); font-size: 13px; font-weight: 700; color: white; }
		.dew-secondary { font-family: var(--font-display); font-size: 12px; color: rgba(255,255,255,0.55); margin-left: 4px; }
	`,
})
export class CurrentConditionsComponent {
	i18n = inject(I18nService);

	data = input.required<WeatherData>();
	metricPrimary = input.required<boolean>();
	loc = input.required<(s: string) => string>();
	onToggleUnits = output<void>();

	tempDual = computed(() => { const [a, b] = this.data().temperature.displayDual(this.metricPrimary()); return [this.loc()(a), this.loc()(b)]; });
	feelsLikeDual = computed(() => { const [a, b] = this.data().feelsLike.displayDual(this.metricPrimary()); return [this.loc()(a), this.loc()(b)]; });
	snowDual = computed(() => { const s = this.data().snow; if (!s) return null; const [a, b] = s.displayDual(this.metricPrimary()); return [this.loc()(a), this.loc()(b)]; });
	rainDual = computed(() => { const r = this.data().rain; if (!r) return null; const [a, b] = r.displayDual(this.metricPrimary()); return [this.loc()(a), this.loc()(b)]; });
	minDual = computed(() => { const [a, b] = this.data().tempMin.displayDual(this.metricPrimary()); return [this.loc()(a), this.loc()(b)]; });
	maxDual = computed(() => { const [a, b] = this.data().tempMax.displayDual(this.metricPrimary()); return [this.loc()(a), this.loc()(b)]; });
	windDual = computed(() => { const [a, b] = this.data().windSpeed.displayDual(this.metricPrimary()); return [this.loc()(a), this.loc()(b)]; });
	gustDual = computed(() => { const g = this.data().windGust; if (!g) return null; const [a, b] = g.displayDual(this.metricPrimary()); return [this.loc()(a), this.loc()(b)]; });
	pressDual = computed(() => { const [a, b] = this.data().pressure.displayDual(this.metricPrimary()); return [this.loc()(a), this.loc()(b)]; });
	dewDual = computed(() => { const [a, b] = this.data().dewPoint.displayDual(this.metricPrimary()); return [this.loc()(a), this.loc()(b)]; });

	windSubtitle = computed(() => {
		const d = this.data();
		return this.loc()(`${this.getCardinalDirection(d.windDeg)} (${d.windDeg}°)`);
	});

	visDual = computed(() => {
		const m = this.data().visibility;
		const km = (m / 1000).toFixed(1);
		const mi = (m / 1609.34).toFixed(2);
		return this.metricPrimary()
			? [this.loc()(`${km} km`), this.loc()(`${mi} mi`)]
			: [this.loc()(`${mi} mi`), this.loc()(`${km} km`)];
	});

	uvLabel = computed(() => {
		const labels = this.i18n.tArray('uv_labels');
		if (labels.length === 0) return '';
		const uv = this.data().uvIndex;
		if (uv < 3) return labels[0];
		if (uv < 6) return labels[1];
		if (uv < 8) return labels[2];
		if (uv < 11) return labels[3];
		return labels[4];
	});

	formatTime(epochSec: number): string {
		const d = new Date(epochSec * 1000);
		return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
	}

	private getCardinalDirection(deg: number): string {
		const dirs = this.i18n.tArray('cardinal_directions');
		if (dirs.length === 0) return '';
		const idx = ((deg % 360 + 360) % 360 * 16 / 360) % 16;
		return dirs[Math.round(idx)] ?? '';
	}
}
