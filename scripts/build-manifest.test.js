import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { scanPhotosDir, buildManifest } from './build-manifest.js';

test('scanPhotosDir keeps only recognized image extensions, case-insensitively, sorted', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'photos-test-'));
  try {
    writeFileSync(path.join(dir, 'b.png'), '');
    writeFileSync(path.join(dir, 'A_b.JPG'), '');
    writeFileSync(path.join(dir, 'notes.txt'), '');
    assert.deepEqual(scanPhotosDir(dir), ['A_b.JPG', 'b.png']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('buildManifest maps filenames to {file, name}, sorted regardless of input order', () => {
  const result = buildManifest(['b.png', 'Ivan_Petrov.jpg']);
  assert.deepEqual(result, [
    { file: 'Ivan_Petrov.jpg', name: 'Ivan Petrov' },
    { file: 'b.png', name: 'b' },
  ]);
});

test('buildManifest on an empty list returns an empty array', () => {
  assert.deepEqual(buildManifest([]), []);
});
