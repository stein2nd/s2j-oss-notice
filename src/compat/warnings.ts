export function summarizeWarnings(warnings: string[]): string | null {
  if (warnings.length === 0) {
    return null;
  }

  const buckets = new Map<string, number>();
  for (const w of warnings) {
    const key = w.startsWith("missing license text")
      ? "missing license text"
      : w.startsWith("no license information")
        ? "no license information"
        : "other";
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  const parts = [...buckets.entries()].map(([k, n]) => `${n} ${k}`);
  return `warnings: ${warnings.length} (${parts.join(", ")})`;
}