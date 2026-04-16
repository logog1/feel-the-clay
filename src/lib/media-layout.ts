import type { CSSProperties } from "react";

export type FrameStyle = "none" | "thin" | "rounded" | "shadow" | "polaroid" | "thick";
export type MediaDevice = "phone" | "desktop";
export type MediaPreviewContext = "hero" | "card";
export type MediaUsageId = "home_hero" | "workshop_card" | "workshop_hero";

export interface MediaViewportLayout {
  zoom: number;
  x: number;
  y: number;
  ratio: number;
}

export interface MediaLayoutSettings {
  phone: MediaViewportLayout;
  desktop: MediaViewportLayout;
}

export interface MediaUsageConfig {
  usageId: MediaUsageId;
  label: string;
  description: string;
  previewContext: MediaPreviewContext;
}

export const FRAME_OPTIONS: { value: FrameStyle; label: string; emoji: string }[] = [
  { value: "none", label: "None", emoji: "🖼" },
  { value: "thin", label: "Thin", emoji: "▫️" },
  { value: "thick", label: "Thick", emoji: "⬜" },
  { value: "rounded", label: "Round", emoji: "🔘" },
  { value: "shadow", label: "Shadow", emoji: "🌑" },
  { value: "polaroid", label: "Polaroid", emoji: "📷" },
];

export const DEFAULT_MEDIA_VIEWPORT_LAYOUT: MediaViewportLayout = {
  zoom: 1,
  x: 50,
  y: 50,
  ratio: 16 / 9,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function createDefaultMediaLayout(): MediaLayoutSettings {
  return {
    phone: { ...DEFAULT_MEDIA_VIEWPORT_LAYOUT },
    desktop: { ...DEFAULT_MEDIA_VIEWPORT_LAYOUT },
  };
}

function normalizeViewportLayout(value: unknown): MediaViewportLayout {
  const input = typeof value === "object" && value !== null ? (value as Partial<MediaViewportLayout>) : {};

  return {
    zoom: clamp(typeof input.zoom === "number" ? input.zoom : 1, 1, 3),
    x: clamp(typeof input.x === "number" ? input.x : 50, 0, 100),
    y: clamp(typeof input.y === "number" ? input.y : 50, 0, 100),
    ratio: clamp(typeof input.ratio === "number" ? input.ratio : 16 / 9, 0.7, 2.4),
  };
}

export function parseMediaLayout(value?: string | null): MediaLayoutSettings {
  if (!value) return createDefaultMediaLayout();

  try {
    const parsed = JSON.parse(value);
    return {
      phone: normalizeViewportLayout(parsed?.phone),
      desktop: normalizeViewportLayout(parsed?.desktop),
    };
  } catch {
    return createDefaultMediaLayout();
  }
}

export function getViewportLayout(layout: MediaLayoutSettings | undefined, device: MediaDevice): MediaViewportLayout {
  return normalizeViewportLayout(layout?.[device]);
}

export function getMediaPresentationStyle(layout?: Partial<MediaViewportLayout>): CSSProperties {
  const normalized = normalizeViewportLayout(layout);

  return {
    objectFit: "cover",
    objectPosition: `${normalized.x}% ${normalized.y}%`,
    transformOrigin: `${normalized.x}% ${normalized.y}%`,
    transform: `scale(${normalized.zoom})`,
  };
}

export function getViewportAspectRatio(layout: MediaLayoutSettings | undefined, device: MediaDevice, fallback: number) {
  return normalizeViewportLayout(layout?.[device]).ratio || fallback;
}

export function getFrameClasses(frame: FrameStyle): string {
  switch (frame) {
    case "thin":
      return "ring-1 ring-border";
    case "thick":
      return "ring-4 ring-border";
    case "rounded":
      return "rounded-3xl ring-2 ring-border/60";
    case "shadow":
      return "shadow-2xl ring-1 ring-border/30";
    case "polaroid":
      return "ring-4 ring-white shadow-xl pb-8 bg-white";
    default:
      return "";
  }
}

export function getMediaUsageConfigs(imageKey: string): MediaUsageConfig[] {
  if (imageKey === "image_hero_bg") {
    return [
      {
        usageId: "home_hero",
        label: "Homepage Hero",
        description: "This is the landing page hero image on the main website.",
        previewContext: "hero",
      },
    ];
  }

  return [
    {
      usageId: "workshop_card",
      label: "Homepage Card",
      description: "This crop is used on the workshop cards on the homepage.",
      previewContext: "card",
    },
    {
      usageId: "workshop_hero",
      label: "Workshop Page Hero",
      description: "This crop is used as the top hero image on the workshop page.",
      previewContext: "hero",
    },
  ];
}

export function getMediaLayoutId(usageId: MediaUsageId, imageKey: string): string {
  return `${usageId}__${imageKey}`;
}

export function getMediaLayoutSiteSettingKey(layoutId: string): string {
  return `media_layout_${layoutId}`;
}
