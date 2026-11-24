const VALID_ID = /^[A-Za-z0-9.+-]+$/;
const SPDX_LICENSES = "https://spdx.org/licenses";

export type LicenseFetchResult = {
  text: string | null;
  isException: boolean;
};

function parseField(payload: unknown, isException: boolean): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const record = payload as Record<string, unknown>;
  const field = isException ? "licenseExceptionText" : "licenseText";
  const value = record[field];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function fetchOnce(url: string): Promise<Response> {
  return fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
}

export async function fetchSpdxLicenseText(
  licenseId: string,
  retries = 3,
  backoffMs = 200,
): Promise<LicenseFetchResult | null> {
  if (!VALID_ID.test(licenseId)) {
    return null;
  }

  const url = `${SPDX_LICENSES}/${encodeURIComponent(licenseId)}.json`;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetchOnce(url);
      if (response.status === 404) {
        return { text: null, isException: false };
      }
      if (!response.ok) {
        throw new Error(`http ${response.status}`);
      }
      const body = (await response.json()) as unknown;
      const isException = Boolean(
        body && typeof body === "object" && (body as Record<string, unknown>).isExceptionLicense,
      );
      const text = parseField(body, isException);
      return { text, isException };
    } catch {
      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, backoffMs * 2 ** attempt));
      }
    }
  }
  return { text: null, isException: false };
}