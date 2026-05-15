import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable zellige-inspired SVG symbols for the Sofitel page.
 * Used as section dividers, separators, and small accent icons.
 *
 * All symbols inherit `currentColor` so they can be tinted via Tailwind
 * `text-*` utilities or inline `style={{ color }}`.
 */

type SymbolProps = React.SVGProps<SVGSVGElement> & {
  size?: number | string;
};

const base = (extra?: string) =>
  cn("inline-block shrink-0 align-middle", extra);

/* ---------- Atomic symbols ---------- */

// 8-point Moroccan star (the classic zellige khatam)
export function ZelligeStar({ size = 20, className, ...props }: SymbolProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
      aria-hidden
      className={base(className)}
      {...props}
    >
      <path d="M20 2 L24 12 L34 8 L30 18 L40 22 L30 26 L34 36 L24 32 L20 42 L16 32 L6 36 L10 26 L0 22 L10 18 L6 8 L16 12 Z" />
      <circle cx="20" cy="22" r="4" fill="currentColor" stroke="none" opacity="0.65" />
    </svg>
  );
}

// 4-point diamond / lozenge
export function ZelligeDiamond({ size = 14, className, ...props }: SymbolProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      aria-hidden
      className={base(className)}
      {...props}
    >
      <path d="M10 1 L19 10 L10 19 L1 10 Z" />
      <path d="M10 5 L15 10 L10 15 L5 10 Z" opacity="0.6" />
      <circle cx="10" cy="10" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Tiny cross / plus accent
export function ZelligeCross({ size = 12, className, ...props }: SymbolProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      aria-hidden
      className={base(className)}
      {...props}
    >
      <path d="M8 1.5 L8 14.5 M1.5 8 L14.5 8" />
      <circle cx="8" cy="8" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Rosette / 6-petal flower
export function ZelligeRosette({ size = 18, className, ...props }: SymbolProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.9"
      aria-hidden
      className={base(className)}
      {...props}
    >
      <circle cx="12" cy="12" r="3.2" />
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i * 60 * Math.PI) / 180;
        const x = 12 + Math.cos(a) * 6.5;
        const y = 12 + Math.sin(a) * 6.5;
        return <circle key={i} cx={x} cy={y} r="3.2" />;
      })}
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Sparkle / 4-point seed
export function ZelligeSparkle({ size = 10, className, ...props }: SymbolProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden
      className={base(className)}
      {...props}
    >
      <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" />
    </svg>
  );
}

// Dot
export function ZelligeDot({ size = 6, className, ...props }: SymbolProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 6 6"
      fill="currentColor"
      aria-hidden
      className={base(className)}
      {...props}
    >
      <circle cx="3" cy="3" r="3" />
    </svg>
  );
}

/* ---------- Composite separators ---------- */

/**
 * Full-width horizontal divider with a centered zellige medallion.
 * Use between major sections.
 */
export function ZelligeDivider({
  className,
  symbol = "star",
  lineColor,
  symbolColor,
}: {
  className?: string;
  symbol?: "star" | "diamond" | "rosette" | "sparkle";
  lineColor?: string;
  symbolColor?: string;
}) {
  const Sym =
    symbol === "diamond"
      ? ZelligeDiamond
      : symbol === "rosette"
      ? ZelligeRosette
      : symbol === "sparkle"
      ? ZelligeSparkle
      : ZelligeStar;

  return (
    <div
      className={cn(
        "flex items-center gap-4 w-full select-none",
        className
      )}
      aria-hidden
    >
      <span
        className="h-px flex-1"
        style={{ background: lineColor ?? "currentColor", opacity: 0.25 }}
      />
      <span
        className="inline-flex items-center gap-2"
        style={{ color: symbolColor ?? "currentColor" }}
      >
        <ZelligeDot size={4} className="opacity-60" />
        <Sym size={symbol === "rosette" ? 22 : 24} className="opacity-90" />
        <ZelligeDot size={4} className="opacity-60" />
      </span>
      <span
        className="h-px flex-1"
        style={{ background: lineColor ?? "currentColor", opacity: 0.25 }}
      />
    </div>
  );
}

/**
 * Inline tiny separator: dot · sparkle · dot.
 * Use inline within a line of text or eyebrow labels.
 */
export function ZelligeInlineSeparator({
  className,
  color,
}: {
  className?: string;
  color?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 align-middle", className)}
      style={{ color: color ?? "currentColor" }}
      aria-hidden
    >
      <ZelligeDot size={3} className="opacity-70" />
      <ZelligeSparkle size={9} />
      <ZelligeDot size={3} className="opacity-70" />
    </span>
  );
}

/**
 * Repeating tile band: a thin horizontal strip of alternating glyphs.
 * Use as a decorative band between sections.
 */
export function ZelligeTileBand({
  className,
  color,
  density = 12,
}: {
  className?: string;
  color?: string;
  density?: number;
}) {
  const glyphs = [ZelligeDiamond, ZelligeCross, ZelligeStar, ZelligeSparkle];
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-5 py-2 overflow-hidden",
        className
      )}
      style={{ color: color ?? "currentColor" }}
      aria-hidden
    >
      {Array.from({ length: density }).map((_, i) => {
        const G = glyphs[i % glyphs.length];
        return (
          <G
            key={i}
            size={i % 4 === 2 ? 14 : 10}
            className={cn("opacity-60", i % 4 === 2 && "opacity-80")}
          />
        );
      })}
    </div>
  );
}
