#!/usr/bin/env node
// Checks that the app can work offline:
//   - every file in the service worker list exists
//   - every file the app loads is in that list
//   - the CDN files that app.js loads are in the CDN list
//   - the manifest, the service worker and pwa.js use no root-absolute paths
// Run with: npm test

const fs = require('fs');
const path = require('path');

const PUBLIC = path.join(__dirname, '..', 'public');
const problems = [];
const fail = (message) => problems.push(message);
const read = (file) => fs.readFileSync(path.join(PUBLIC, file), 'utf8');

// Turn './js/app.js' into 'js/app.js' and './' into 'index.html'
const normalise = (entry) => {
	const clean = entry.replace(/^\.\//, '').split(/[?#]/)[0];
	return clean === '' ? 'index.html' : clean;
};

const listFrom = (source, name) => {
	const match = source.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`));
	if (!match) {
		fail(`sw.js: list ${name} not found`);
		return [];
	}
	return [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
};

const walk = (dir) => fs.readdirSync(path.join(PUBLIC, dir), { withFileTypes: true }).flatMap((entry) => {
	const relative = `${dir}/${entry.name}`;
	return entry.isDirectory() ? walk(relative) : [relative];
});

const sw = read('sw.js');
const staticEntries = listFrom(sw, 'STATIC_FILES');
const cdnEntries = listFrom(sw, 'CDN_FILES');
const cached = new Set(staticEntries.map(normalise));

// 1. Every listed file exists and is written relative to sw.js
staticEntries.forEach((entry) => {
	if (!entry.startsWith('./')) fail(`sw.js: "${entry}" must start with ./ (relative path)`);
	if (!fs.existsSync(path.join(PUBLIC, normalise(entry)))) fail(`sw.js: "${entry}" does not exist in public/`);
});

// 2. Every file that the app loads is listed
const required = new Set(['index.html', 'manifest.json', 'css/style.min.css']);
walk('js').forEach((file) => required.add(file));
walk('assets/icons').forEach((file) => required.add(file));

const html = read('index.html');
[...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].forEach((m) => required.add(m[1]));
[...html.matchAll(/<link[^>]*\srel="(?:stylesheet|manifest|icon|apple-touch-icon)"[^>]*\shref="([^"]+)"/g)]
	.forEach((m) => required.add(m[1]));

const manifest = JSON.parse(read('manifest.json'));
(manifest.icons || []).forEach((icon) => required.add(icon.src));

required.forEach((file) => {
	if (/^(https?:)?\/\//.test(file)) return; // external, not cached from public/
	if (!cached.has(normalise(file))) fail(`sw.js: "${file}" is loaded by the app but is not in STATIC_FILES`);
});

// 3. CDN files that app.js loads
[...read('js/app.js').matchAll(/https:\/\/cdnjs\.cloudflare\.com[^'"`]+/g)].forEach((m) => {
	if (!cdnEntries.includes(m[0])) fail(`sw.js: CDN file "${m[0]}" from app.js is not in CDN_FILES`);
});

// 4. No root-absolute paths, which break on sub-folder hosting
const rootAbsolute = /['"]\/(?!\/)[^'"]*['"]/;
[
	['manifest.json', read('manifest.json')],
	['sw.js', sw],
	['js/pwa.js', read('js/pwa.js')]
].forEach(([file, text]) => {
	text.split('\n').forEach((line, index) => {
		if (/^\s*\/\//.test(line)) return; // comment
		if (rootAbsolute.test(line) && !/https?:\/\//.test(line)) fail(`${file}:${index + 1}: root-absolute path: ${line.trim()}`);
	});
});

if (problems.length > 0) {
	console.error(`Offline check failed (${problems.length}):`);
	problems.forEach((problem) => console.error(`  - ${problem}`));
	process.exit(1);
}
console.log(`Offline check passed: ${cached.size} cached files, ${cdnEntries.length} CDN files.`);
