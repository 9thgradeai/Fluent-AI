import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
  {
    variants: {
      variant: {
        signal:
          "bg-signal text-signal-foreground shadow-sm shadow-signal/20 hover:bg-signal/90 hover:shadow-md hover:shadow-signal/25",
        dark: "bg-primary text-primary-foreground hover:opacity-90",
        outline:
          "border border-border bg-background text-foreground hover:border-foreground/30 hover:bg-muted/60",
        ghost: "text-foreground hover:bg-muted",
        subtle: "bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-7 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "signal",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, children, ...props }: ButtonProps) {
  // asChild is kept in the API for parity; we render plain buttons throughout.
  const Comp: React.ElementType = asChild ? "span" : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {children}
    </Comp>
  );
}

export { buttonVariants };