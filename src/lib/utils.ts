import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Decode HTML entities and clean HTML content for display
 * Converts <br> to newlines and strips other HTML tags
 */
export function cleanHtmlContent(html: string): string {
  if (!html) return "";

  // Decode HTML entities
  const decoded = html
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, "\"")
    .replace(/&rdquo;/g, "\"")
    .replace(/&hellip;/g, "…");

  // Convert <br> and </p><p> to newlines
  const withLineBreaks = decoded
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n\n")
    .replace(/<p>/gi, "")
    .replace(/<\/p>/gi, "");

  // Strip remaining HTML tags
  const stripped = withLineBreaks.replace(/<[^>]+>/g, "");

  // Clean up multiple newlines and trim
  return stripped
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
