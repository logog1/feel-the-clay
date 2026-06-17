import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { type LucideIcon } from "lucide-react";

/**
 * Recurring "rounded square with cta tint + icon" pattern used in section
 * headers across Store, Cart, AdminLogin, and dashboard cards. Wraps the
 * sizing/tint logic so callers only pass an icon.
 */
const tileVariants = cva(
  "rounded-2xl bg-cta/10 border-2 border-cta/20 flex items-center justify-center flex-shrink-0",
  {
    variants: {
      size: {
        sm: "w-10 h-10",
        md: "w-12 h-12",
        lg: "w-14 h-14",
      },
    },
    defaultVariants: { size: "md" },
  }
);

const iconSizes: Record<NonNullable<VariantProps<typeof tileVariants>["size"]>, number> = {
  sm: 18,
  md: 22,
  lg: 26,
};

interface IconTileProps extends VariantProps<typeof tileVariants> {
  icon: LucideIcon;
  className?: string;
}

export const IconTile = ({ icon: Icon, size = "md", className }: IconTileProps) => (
  <div className={cn(tileVariants({ size }), className)}>
    <Icon size={iconSizes[size!]} className="text-cta" />
  </div>
);
