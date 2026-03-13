import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, basename } from 'node:path';

const PACKAGES_DIR = 'packages';
const COVERAGE_FILE = 'coverage/coverage-summary.json';
export const BADGE_DIR = 'badges';
export const BADGE_FILENAME = 'coverage.svg';

const COLOR_GREEN = '#4c1';
const COLOR_YELLOW = '#dfb317';
const COLOR_RED = '#e05d44';
const THRESHOLD_GREEN = 90;
const THRESHOLD_YELLOW = 75;

export function discoverCoveragePaths(root) {
  const packagesDir = resolve(root, PACKAGES_DIR);
  if (!existsSync(packagesDir)) return [];

  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => resolve(packagesDir, d.name, COVERAGE_FILE));
}

export function parseCoverageFile(filePath) {
  if (!existsSync(filePath)) return 0;
  const data = JSON.parse(readFileSync(filePath, 'utf8'));
  return data.total.statements.pct;
}

export function computeAverage(paths) {
  if (paths.length === 0) {
    return { pct: 0, details: [] };
  }

  const details = paths.map((p) => {
    const name = basename(resolve(p, '..', '..'));
    const pct = parseCoverageFile(p);
    return { name, pct };
  });

  const sum = details.reduce((acc, d) => acc + d.pct, 0);
  const pct = Math.round(sum / details.length);

  return { pct, details };
}

export function pickColor(pct) {
  if (pct >= THRESHOLD_GREEN) return COLOR_GREEN;
  if (pct >= THRESHOLD_YELLOW) return COLOR_YELLOW;
  return COLOR_RED;
}

export function generateBadgeSvg(pct) {
  const color = pickColor(pct);
  const label = 'coverage';
  const value = `${pct}%`;
  const labelWidth = 60;
  const valueWidth = 44;
  const totalWidth = labelWidth + valueWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${totalWidth}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${labelWidth / 2}" y="14">${label}</text>
    <text x="${labelWidth + valueWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
    <text x="${labelWidth + valueWidth / 2}" y="14">${value}</text>
  </g>
</svg>`;
}
