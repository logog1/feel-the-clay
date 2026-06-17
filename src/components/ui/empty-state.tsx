import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Unified empty state. Use anywhere a list, table, or grid would otherwise
 * render zero items (Store category, Cart, dashboard tables).
 */
export const EmptyState = ({ icon: Icon, title, description, action, className }: EmptyStateProps) => (
  <div
    role="status"
    className={cn(
      "flex flex-col items-center justify-center text-center px-6 py-12 rounded-2xl",
      "bg-card/60 border border-dashed border-border/60",
      className
    )}
  >
    {Icon && (
      <div className="w-14 h-14 mb-4 rounded-2xl bg-cta/10 border border-cta/20 flex items-center justify-center">
        <Icon className="w-6 h-6 text-cta/70" aria-hidden="true" />
      </div>
    )}
    <h3 className="text-base font-semibold text-foreground">{title}</h3>
    {description && (
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

interface LoadingStateProps {
  label?: string;
  className?: string;
}

/** Compact, accessible loading row — used inline above grids or in cards. */
export const LoadingState = ({ label = "Loading…", className }: LoadingStateProps) => (
  <div
    role="status"
    aria-live="polite"
    className={cn("flex items-center justify-center gap-3 py-8 text-sm text-muted-foreground", className)}
  >
    <span
      className="inline-block w-4 h-4 rounded-full border-2 border-cta/30 border-t-cta animate-spin"
      aria-hidden="true"
    />
    <span>{label}</span>
  </div>
);

interface SkeletonGridProps {
  count?: number;
  className?: string;
  itemClassName?: string;
}

/** Skeleton placeholder grid for product / card listings. */
export const SkeletonGrid = ({
  count = 6,
  className = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4",
  itemClassName = "aspect-square",
}: SkeletonGridProps) => (
  <div className={className} aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={cn("skeleton", itemClassName)} />
    ))}
  </div>
);
