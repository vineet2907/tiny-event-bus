import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolve } from 'node:path';

vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
  readdirSync: vi.fn(),
  existsSync: vi.fn(),
}));

const { readFileSync, readdirSync, existsSync } = await import('node:fs');
const {
  discoverCoveragePaths,
  parseCoverageFile,
  computeAverage,
  pickColor,
  generateBadgeSvg,
} = await import('../coverage-badge.mjs');

beforeEach(() => {
  vi.clearAllMocks();
});

describe('pickColor', () => {
  it('returns green at 90%', () => {
    expect(pickColor(90)).toBe('#4c1');
  });

  it('returns green above 90%', () => {
    expect(pickColor(100)).toBe('#4c1');
  });

  it('returns yellow at 75%', () => {
    expect(pickColor(75)).toBe('#dfb317');
  });

  it('returns yellow between 75-89%', () => {
    expect(pickColor(89)).toBe('#dfb317');
  });

  it('returns red below 75%', () => {
    expect(pickColor(74)).toBe('#e05d44');
  });

  it('returns red at 0%', () => {
    expect(pickColor(0)).toBe('#e05d44');
  });
});

describe('parseCoverageFile', () => {
  it('extracts total statements percentage', () => {
    existsSync.mockReturnValue(true);
    readFileSync.mockReturnValue(
      JSON.stringify({ total: { statements: { pct: 87.5 } } }),
    );
    expect(parseCoverageFile('/fake/path.json')).toBe(87.5);
  });

  it('returns 0 when file does not exist', () => {
    existsSync.mockReturnValue(false);
    expect(parseCoverageFile('/missing/path.json')).toBe(0);
  });
});

describe('computeAverage', () => {
  it('returns 0 with empty details for empty paths', () => {
    const result = computeAverage([]);
    expect(result).toEqual({ pct: 0, details: [] });
  });

  it('computes average across multiple packages', () => {
    existsSync.mockReturnValue(true);
    readFileSync
      .mockReturnValueOnce(
        JSON.stringify({ total: { statements: { pct: 80 } } }),
      )
      .mockReturnValueOnce(
        JSON.stringify({ total: { statements: { pct: 100 } } }),
      );

    const result = computeAverage([
      '/root/packages/core/coverage/coverage-summary.json',
      '/root/packages/react/coverage/coverage-summary.json',
    ]);

    expect(result.pct).toBe(90);
    expect(result.details).toEqual([
      { name: 'core', pct: 80 },
      { name: 'react', pct: 100 },
    ]);
  });

  it('rounds the average', () => {
    existsSync.mockReturnValue(true);
    readFileSync
      .mockReturnValueOnce(
        JSON.stringify({ total: { statements: { pct: 91 } } }),
      )
      .mockReturnValueOnce(
        JSON.stringify({ total: { statements: { pct: 92 } } }),
      )
      .mockReturnValueOnce(
        JSON.stringify({ total: { statements: { pct: 93 } } }),
      );

    const result = computeAverage([
      '/root/packages/a/coverage/coverage-summary.json',
      '/root/packages/b/coverage/coverage-summary.json',
      '/root/packages/c/coverage/coverage-summary.json',
    ]);

    expect(result.pct).toBe(92);
  });
});

describe('discoverCoveragePaths', () => {
  it('returns empty array when packages dir does not exist', () => {
    existsSync.mockReturnValue(false);
    expect(discoverCoveragePaths('/root')).toEqual([]);
  });

  it('discovers coverage paths for all packages', () => {
    existsSync.mockImplementation((p) => {
      if (p === resolve('/root', 'packages')) return true;
      return false;
    });

    readdirSync.mockReturnValue([
      { name: 'core', isDirectory: () => true },
      { name: 'react', isDirectory: () => true },
    ]);

    const paths = discoverCoveragePaths('/root');
    expect(paths).toHaveLength(2);
    expect(paths[0]).toContain('core');
    expect(paths[1]).toContain('react');
  });

  it('includes packages without coverage data', () => {
    existsSync.mockImplementation((p) => {
      if (p === resolve('/root', 'packages')) return true;
      return false;
    });

    readdirSync.mockReturnValue([
      { name: 'core', isDirectory: () => true },
      { name: 'new-pkg', isDirectory: () => true },
    ]);

    const paths = discoverCoveragePaths('/root');
    expect(paths).toHaveLength(2);
    expect(paths[0]).toContain('core');
    expect(paths[1]).toContain('new-pkg');
  });
});

describe('generateBadgeSvg', () => {
  it('produces valid SVG with correct percentage', () => {
    const svg = generateBadgeSvg(95);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('95%');
  });

  it('uses green color for high coverage', () => {
    const svg = generateBadgeSvg(100);
    expect(svg).toContain('#4c1');
  });

  it('uses red color for low coverage', () => {
    const svg = generateBadgeSvg(50);
    expect(svg).toContain('#e05d44');
  });
});
