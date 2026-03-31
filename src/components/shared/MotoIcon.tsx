import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

export function MotoIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    >
      <circle cx="18" cy="46" r="7.5" />
      <circle cx="47" cy="46" r="7.5" />
      <path d="M25.5 46h10l6-11h6.5" />
      <path d="M29 35l-6.5 11" />
      <path d="M36 35l11 11" />
      <path d="M24 27h9l8 8" />
      <path d="M42 27h8" />
      <path d="M31 27l-2 8" />
    </svg>
  );
}
