/**
 * Post-build: inline all JS and CSS into index.html.
 *
 * SvelteKit emits a handful of tiny JS files (~70B re-exports) + one big
 * bundle + one CSS file.  This script inlines the CSS as a <style> tag and
 * converts every JS module to a data: URI via an <script type="importmap">.
 * Result: the browser fetches ONE html file for the entire app shell.
 */
import { readFileSync, writeFileSync, unlinkSync, readdirSync, statSync, rmdirSync } from 'fs';
import { join, resolve, dirname } from 'path';

const BUILD = resolve('build');
const HTML_PATH = join(BUILD, 'index.html');

let html = readFileSync(HTML_PATH, 'utf-8');

// ── 1. Inline CSS ─────────────────────────────────────────────────
html = html.replace(
	/<link\s+href="([^"]+\.css)"\s+rel="stylesheet"\s*>/gi,
	(orig, href) => {
		try {
			const css = readFileSync(join(BUILD, href), 'utf-8');
			unlinkSync(join(BUILD, href));
			return `<style>${css}</style>`;
		} catch { return orig; }
	}
);

// Remove modulepreload links
html = html.replace(/<link\s+rel="modulepreload"\s+href="[^"]+"\s*>/gi, '');

// ── 2. Collect all JS modules ─────────────────────────────────────
const modules = {};  // path → source code

function collectJS(dir) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) { collectJS(full); continue; }
		if (!entry.endsWith('.js')) continue;
		const relPath = '/' + full.slice(BUILD.length + 1);
		modules[relPath] = readFileSync(full, 'utf-8');
		unlinkSync(full);
	}
}

try { collectJS(join(BUILD, '_app', 'immutable')); } catch {}
try {
	const envPath = join(BUILD, '_app', 'env.js');
	modules['/_app/env.js'] = readFileSync(envPath, 'utf-8');
	unlinkSync(envPath);
} catch {}

// ── 3. Resolve relative imports to absolute paths ─────────────────
for (const [modPath, code] of Object.entries(modules)) {
	const dir = dirname(modPath);
	modules[modPath] = code
		.replace(/from\s*"(\.[^"]+)"/g, (_, rel) => {
			const abs = '/' + resolve(BUILD + dir, rel).slice(BUILD.length + 1);
			return `from"${abs}"`;
		})
		.replace(/import\(\s*"(\.[^"]+)"\s*\)/g, (_, rel) => {
			const abs = '/' + resolve(BUILD + dir, rel).slice(BUILD.length + 1);
			return `import("${abs}")`;
		});
}

// ── 4. Build import map: path → data:... URI ──────────────────────
const importMap = {};
for (const [modPath, code] of Object.entries(modules)) {
	importMap[modPath] = `data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`;
}

const importMapTag = `<script type="importmap">${JSON.stringify({ imports: importMap })}</script>`;

// Insert import map before the first <script> in <body> (or end of <head>)
html = html.replace(
	/(<div style="display: contents">)/,
	importMapTag + '\n\t\t$1'
);

writeFileSync(HTML_PATH, html);

// ── 5. Clean up empty directories ─────────────────────────────────
function removeEmptyDirs(dir) {
	try {
		for (const entry of readdirSync(dir)) {
			const full = join(dir, entry);
			if (statSync(full).isDirectory()) removeEmptyDirs(full);
		}
		if (readdirSync(dir).length === 0) rmdirSync(dir);
	} catch {}
}
removeEmptyDirs(join(BUILD, '_app'));

const htmlSize = (readFileSync(HTML_PATH).length / 1024).toFixed(1);
console.log(`Inlined ${Object.keys(modules).length} modules + CSS into index.html (${htmlSize} KB)`);
