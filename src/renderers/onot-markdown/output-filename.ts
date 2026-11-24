const UNSAFE = /[^A-Za-z0-9._-]+/g;

export function slugifyProduct(name: string): string {
  const slug = name.trim().replace(UNSAFE, "_").replace(/^_|_$/g, "");
  return slug || "OSS_Notice";
}

export function outputFilename(product: string, ext: string, now: Date): string {
  const stamp = formatTimestamp(now);
  return `OSS_Notice_${slugifyProduct(product)}_${stamp}.${ext}`;
}

function formatTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}_` +
    `${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}`
  );
}