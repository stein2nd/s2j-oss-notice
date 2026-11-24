import catalogData from "./data/licenses.json" with { type: "json" };

type RawCatalogEntry = {
  name?: string;
  text?: string;
  deprecated?: boolean;
  reference?: string;
};

type LicenseBundle = {
  licenseListVersion?: string;
  licenses?: Record<string, RawCatalogEntry>;
  exceptions?: Record<string, RawCatalogEntry>;
};

const bundle = catalogData as LicenseBundle;
const LICENSES = bundle.licenses ?? {};
const EXCEPTIONS = bundle.exceptions ?? {};

export function bundledCatalogVersion(): string {
  return bundle.licenseListVersion ?? "";
}

export function lookupBundledLicense(
  licenseId: string,
): { name: string; text: string; isException: boolean } | null {
  const lic = LICENSES[licenseId];
  if (lic?.text?.trim()) {
    return {
      name: lic.name?.trim() || licenseId,
      text: lic.text.trim(),
      isException: false,
    };
  }
  const exc = EXCEPTIONS[licenseId];
  if (exc?.text?.trim()) {
    return {
      name: exc.name?.trim() || licenseId,
      text: exc.text.trim(),
      isException: true,
    };
  }
  return null;
}

/** @deprecated Use `lookupBundledLicense`. */
export function lookupBundledLicenseText(licenseId: string): { name: string; text: string } | null {
  const hit = lookupBundledLicense(licenseId);
  if (!hit) {
    return null;
  }
  return { name: hit.name, text: hit.text };
}

export function bundledCatalogEntryCount(): number {
  return Object.keys(LICENSES).length + Object.keys(EXCEPTIONS).length;
}