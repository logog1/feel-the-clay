/**
 * SEO tag uniqueness check.
 *
 * Verifies that SEOHead emits exactly one canonical link and no duplicate
 * Open Graph / Twitter meta tags. Also scans any prerendered HTML files in
 * `dist/` (when a production build exists) and applies the same checks.
 */
import { describe, it, expect, afterEach } from "vitest";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { HelmetProvider } from "react-helmet-async";
import { createElement } from "react";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import SEOHead from "@/components/SEOHead";

let currentRoot: Root | null = null;
let currentContainer: HTMLDivElement | null = null;

afterEach(() => {
  if (currentRoot) {
    act(() => currentRoot!.unmount());
    currentRoot = null;
  }
  if (currentContainer) {
    currentContainer.remove();
    currentContainer = null;
  }
  // Clear any helmet-managed tags between tests.
  document.head.querySelectorAll("[data-rh]").forEach((el) => el.remove());
});

const OG_KEYS = [
  "og:title",
  "og:description",
  "og:url",
  "og:image",
  "og:type",
  "og:site_name",
];
const TWITTER_KEYS = [
  "twitter:title",
  "twitter:description",
  "twitter:image",
  "twitter:card",
];

function collectTags(html: string) {
  const canonicals = [...html.matchAll(/<link[^>]+rel=["']canonical["'][^>]*>/gi)];
  const ogCounts: Record<string, number> = {};
  const twCounts: Record<string, number> = {};

  for (const key of OG_KEYS) {
    const re = new RegExp(`<meta[^>]+property=["']${key}["'][^>]*>`, "gi");
    ogCounts[key] = (html.match(re) || []).length;
  }
  for (const key of TWITTER_KEYS) {
    const re = new RegExp(`<meta[^>]+name=["']${key}["'][^>]*>`, "gi");
    twCounts[key] = (html.match(re) || []).length;
  }
  return { canonicalCount: canonicals.length, ogCounts, twCounts };
}

function assertUnique(label: string, tags: ReturnType<typeof collectTags>) {
  expect(tags.canonicalCount, `${label}: canonical count`).toBe(1);
  for (const [key, count] of Object.entries(tags.ogCounts)) {
    expect(count, `${label}: duplicate ${key}`).toBeLessThanOrEqual(1);
  }
  for (const [key, count] of Object.entries(tags.twCounts)) {
    expect(count, `${label}: duplicate ${key}`).toBeLessThanOrEqual(1);
  }
}

async function renderHelmet(node: React.ReactElement): Promise<string> {
  render(createElement(HelmetProvider, null, node));
  // Helmet flushes to document.head asynchronously.
  await new Promise((r) => setTimeout(r, 0));
  return document.head.innerHTML;
}

describe("SEOHead tag uniqueness", () => {
  it("emits exactly one canonical and no duplicate OG/Twitter tags", async () => {
    const html = await renderHelmet(
      createElement(SEOHead, {
        title: "Test Page",
        description: "Test description for SEO uniqueness check.",
        path: "/test",
      }),
    );
    assertUnique("SEOHead basic", collectTags(html));
  });

  it("stays unique when jsonLd is provided", async () => {
    const html = await renderHelmet(
      createElement(SEOHead, {
        title: "Test JSONLD",
        description: "Description",
        path: "/test-jsonld",
        jsonLd: { "@context": "https://schema.org", "@type": "WebPage" },
      }),
    );
    assertUnique("SEOHead with jsonLd", collectTags(html));
  });
});

describe("Prerendered HTML in dist/ (if built)", () => {
  const distDir = resolve(process.cwd(), "dist");
  const hasDist = existsSync(distDir);

  it.skipIf(!hasDist)("each prerendered HTML file has unique SEO tags", () => {
    const htmlFiles: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        const s = statSync(full);
        if (s.isDirectory()) walk(full);
        else if (entry.endsWith(".html")) htmlFiles.push(full);
      }
    };
    walk(distDir);
    expect(htmlFiles.length).toBeGreaterThan(0);

    for (const file of htmlFiles) {
      const html = readFileSync(file, "utf8");
      // Only check files that actually went through SEOHead (have a canonical).
      if (!/rel=["']canonical["']/.test(html)) continue;
      assertUnique(file, collectTags(html));
    }
  });
});
