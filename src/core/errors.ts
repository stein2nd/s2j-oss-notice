export class LicenseResolveError extends Error {
  readonly exitCode = 3;

  constructor(message: string) {
    super(message);
    this.name = "LicenseResolveError";
  }
}

export function exitCodeForLicenseStrict(warnings: string[], strict: boolean): void {
  if (!strict) {
    return;
  }
  const fatal = warnings.some(
    (w) =>
      w.includes("missing license text") ||
      w.includes("no license information") ||
      w.includes("unknown license") ||
      w.includes("license resolution"),
  );
  if (fatal) {
    throw new LicenseResolveError("license resolution failed under --strict");
  }
}