export type CycloneDxLicense = {
  id?: string;
  name?: string;
  text?: { content?: string };
};

export type CycloneDxComponent = {
  name?: string;
  version?: string;
  purl?: string;
  copyright?: string;
  licenses?: Array<{
    license?: CycloneDxLicense;
    expression?: string;
  }>;
};

export type CycloneDxBom = {
  bomFormat?: string;
  specVersion?: string;
  metadata?: {
    component?: { name?: string; version?: string };
  };
  components?: CycloneDxComponent[];
};