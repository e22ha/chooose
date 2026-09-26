export function nameFromFilename(filename) {
  const dot = filename.lastIndexOf('.');
  const base = dot > 0 ? filename.slice(0, dot) : filename;
  return base.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}
