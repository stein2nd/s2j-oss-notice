export const ONOT_FORMATS = ["html", "text", "markdown", "md", "pdf", "txt"] as const;

export type OnotOutputFormat = "html" | "text" | "md";
export type OnotRenderFormat = OnotOutputFormat | "pdf";

const ALIASES: Record<string, OnotRenderFormat> = {
  html: "html",
  text: "text",
  txt: "text",
  md: "md",
  markdown: "md",
  pdf: "pdf",
};

export function normalizeOnotFormat(raw: string): OnotRenderFormat | null {
  return ALIASES[raw.toLowerCase()] ?? null;
}

export function fileExtension(format: OnotRenderFormat): string {
  if (format === "html") {
    return "html";
  }
  if (format === "text") {
    return "txt";
  }
  if (format === "pdf") {
    return "pdf";
  }
  return "md";
}

export function isBinaryFormat(format: string): boolean {
  return format === "pdf";
}