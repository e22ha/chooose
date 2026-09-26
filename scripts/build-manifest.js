import { readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { nameFromFilename } from '../js/manifest-name.js';

export const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

export function scanPhotosDir(dirPath) {
  return readdirSync(dirPath)
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort();
}

export function buildManifest(filenames) {
  return filenames
    .slice()
    .sort()
    .map((file) => ({ file, name: nameFromFilename(file) }));
}

function main() {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const photosDir = path.join(repoRoot, 'photos');
  const manifestPath = path.join(repoRoot, 'manifest.json');
  const files = scanPhotosDir(photosDir);
  const manifest = buildManifest(files);
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Wrote ${manifest.length} entries to manifest.json`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
