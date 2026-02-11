import html2canvas from 'html2canvas';

const BG_COLOR = '#0E0B3D';
const PADDING = 32;
const HEADER_GAP = 16;

/**
 * Capture a DOM element, composite it onto a branded canvas with header text,
 * and share as PNG via Web Share API (or download as fallback).
 */
export async function captureAndShare(
	element: HTMLElement,
	locationName: string,
	dateStr: string
): Promise<void> {
	// Capture the element
	const capture = await html2canvas(element, {
		backgroundColor: BG_COLOR,
		scale: 2,
		useCORS: true,
		logging: false,
	});

	// Measure header text
	const locationFontSize = 28;
	const dateFontSize = 14;
	const copyrightFontSize = 10;
	const headerHeight = locationFontSize + dateFontSize + 8;
	const copyrightHeight = copyrightFontSize + PADDING;

	// Create output canvas
	const width = capture.width + PADDING * 2;
	const height = PADDING + headerHeight + HEADER_GAP + capture.height + copyrightHeight;
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d')!;

	// Background
	ctx.fillStyle = BG_COLOR;
	ctx.fillRect(0, 0, width, height);

	// Header: location name
	ctx.fillStyle = 'white';
	ctx.font = `bold ${locationFontSize}px system-ui, sans-serif`;
	ctx.textBaseline = 'top';
	ctx.fillText(locationName, PADDING, PADDING);

	// Header: date
	ctx.fillStyle = 'rgba(255,255,255,0.7)';
	ctx.font = `${dateFontSize}px system-ui, sans-serif`;
	ctx.fillText(dateStr, PADDING, PADDING + locationFontSize + 4);

	// Captured content
	ctx.drawImage(capture, PADDING, PADDING + headerHeight + HEADER_GAP);

	// Copyright watermark
	ctx.fillStyle = 'rgba(255,255,255,0.25)';
	ctx.font = `${copyrightFontSize}px system-ui, sans-serif`;
	ctx.textAlign = 'center';
	ctx.fillText(
		'\u00A9 Orinasa Njarasoa \u2022 maripanaTokana',
		width / 2,
		height - PADDING / 2 - copyrightFontSize
	);

	// Convert to blob
	const blob = await new Promise<Blob>((resolve) =>
		canvas.toBlob((b) => resolve(b!), 'image/png')
	);

	const file = new File([blob], 'maripanatokana-weather.png', { type: 'image/png' });

	// Share or download
	if (navigator.share && navigator.canShare?.({ files: [file] })) {
		await navigator.share({ files: [file] });
	} else {
		// Fallback: download
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = file.name;
		a.click();
		URL.revokeObjectURL(url);
	}
}
