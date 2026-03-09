import { describe, it, expect } from "vitest";
import { translations, Language } from "@/i18n/translations";

const LANGUAGES: Language[] = ["en", "ar", "es", "fr"];

describe("Translations", () => {
  it("has entries for all 4 languages on every key", () => {
    const missing: string[] = [];
    for (const [key, value] of Object.entries(translations)) {
      for (const lang of LANGUAGES) {
        if (!(lang in (value as Record<string, string>))) {
          missing.push(`${key}.${lang}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it("no empty English translations", () => {
    const empty: string[] = [];
    for (const [key, value] of Object.entries(translations)) {
      const v = value as Record<string, string>;
      if (v.en !== undefined && v.en.trim() === "") {
        empty.push(key);
      }
    }
    expect(empty).toEqual([]);
  });

  it("has at least 50 translation keys", () => {
    expect(Object.keys(translations).length).toBeGreaterThanOrEqual(50);
  });

  it("critical keys exist", () => {
    const critical = ["nav.home", "hero.title1", "booking.title", "offers.pottery"];
    for (const key of critical) {
      expect(translations).toHaveProperty(key);
    }
  });
});
