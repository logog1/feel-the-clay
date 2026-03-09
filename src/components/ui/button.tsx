import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "btn-ripple inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground rounded-lg shadow-sm hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground rounded-lg shadow-sm hover:bg-destructive/90 hover:shadow-md",
        outline: "border border-input bg-background rounded-lg hover:bg-accent hover:text-accent-foreground hover:shadow-sm hover:-translate-y-0.5",
        secondary: "bg-secondary text-secondary-foreground rounded-lg shadow-sm hover:bg-secondary/80 hover:shadow-md",
        ghost: "rounded-lg hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        cta: "bg-cta text-primary-foreground rounded-xl shadow-lg hover:bg-cta-hover hover:shadow-xl hover:-translate-y-1 font-semibold tracking-wide",
        ctaOutline: "border-2 border-cta text-cta rounded-xl hover:bg-cta hover:text-primary-foreground hover:-translate-y-0.5 font-semibold tracking-wide",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
