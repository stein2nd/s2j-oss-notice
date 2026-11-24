export type SpdxPackage = {
  name?: string;
  versionInfo?: string;
  licenseConcluded?: string;
  licenseDeclared?: string;
  copyrightText?: string;
  downloadLocation?: string;
  homepage?: string;
  description?: string;
  externalRefs?: Array<{ referenceType?: string; referenceLocator?: string }>;
};

export type SpdxExtractedLicensingInfo = {
  licenseId: string;
  name?: string;
  extractText?: string;
};

export type SpdxDocument = {
  spdxVersion?: string;
  name?: string;
  packages?: SpdxPackage[];
  hasExtractedLicensingInfos?: SpdxExtractedLicensingInfo[];
};