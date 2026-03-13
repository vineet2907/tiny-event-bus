import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import {
  discoverCoveragePaths,
  computeAverage,
  generateBadgeSvg,
  BADGE_DIR,
  BADGE_FILENAME,
} from './lib/coverage-badge.mjs';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const paths = discoverCoveragePaths(root);

if (paths.length === 0) {
  console.error(
    'No coverage-summary.json files found. Run test:coverage first.',
  );
  process.exit(1);
}

const { pct, details } = computeAverage(paths);
const svg = generateBadgeSvg(pct);

const badgeDir = resolve(root, BADGE_DIR);
mkdirSync(badgeDir, { recursive: true });
writeFileSync(resolve(badgeDir, BADGE_FILENAME), svg);

const breakdown = details.map((d) => `${d.name}: ${d.pct}%`).join(', ');
console.log(`Coverage badge generated: ${pct}% (${breakdown})`);
