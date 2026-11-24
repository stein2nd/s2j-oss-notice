import type { ExtractedLicense, NoticeDocument } from "../types/notice.js";
import type { OnotOutputFormat, OnotRenderFormat } from "../compat/onot-formats.js";
import { renderOnotHtml } from "../renderers/onot-html/render.js";
import { renderOnotMarkdown } from "../renderers/onot-markdown/render.js";
import { renderOnotPdf } from "../renderers/onot-pdf/render.js";
import { renderOnotText } from "../renderers/onot-text/render.js";

export type RenderOnotResult =
  | { kind: "text"; content: string; warnings: string[] }
  | { kind: "binary"; content: Uint8Array; warnings: string[] };

export function renderOnotFormat(
  format: OnotRenderFormat,
  doc: NoticeDocument,
  extracted: ExtractedLicense[],
): RenderOnotResult {
  const markdown = renderOnotMarkdown(doc, extracted);
  const { warnings } = markdown;

  if (format === "pdf") {
    return { kind: "binary", content: renderOnotPdf(doc, extracted), warnings };
  }

  if (format === "md") {
    return { kind: "text", ...markdown };
  }

  if (format === "html") {
    return { kind: "text", content: renderOnotHtml(doc, extracted), warnings };
  }

  return { kind: "text", content: renderOnotText(doc, extracted), warnings };
}

export type { OnotOutputFormat };