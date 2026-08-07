import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants, type ButtonProps } from "@/components/button";

/** Button look as an anchor (CTA). */
export function LinkButton({
  href,
  className,
  variant,
  size,
  children,
  ...props
}: { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  Pick<ButtonProps, "variant" | "size">) {
  const internal = href.startsWith("#") || href.startsWith("/");
  const cls = cn(buttonVariants({ variant, size }), className);
  if (internal) {
    return (
      <Link href={href} className={cls} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={cls} {...props}>
      {children}
    </a>
  );
}