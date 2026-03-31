import { cn } from "@/lib/utils";
import { Truck } from "lucide-react";

interface BrandedLoaderProps {
  /** Full-page centered loader */
  fullPage?: boolean;
  /** Show text below the spinner */
  text?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Loader personalizado "Leva e Traz" com animação de caminhão + progress ring.
 */
export function BrandedLoader({
  fullPage = false,
  text = "Carregando...",
  size = "md",
  className,
}: BrandedLoaderProps) {
  const sizeMap = {
    sm: { ring: "h-10 w-10", icon: "h-4 w-4", text: "text-xs", gap: "gap-2" },
    md: { ring: "h-16 w-16", icon: "h-6 w-6", text: "text-sm", gap: "gap-3" },
    lg: { ring: "h-24 w-24", icon: "h-10 w-10", text: "text-base", gap: "gap-4" },
  };

  const s = sizeMap[size];

  const loader = (
    <div className={cn("flex flex-col items-center", s.gap, className)}>
      {/* Animated ring + icon */}
      <div className="relative">
        {/* Spinning ring */}
        <svg
          className={cn("animate-spin", s.ring)}
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background track */}
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="hsl(var(--muted))"
            strokeWidth="3"
          />
          {/* Animated arc */}
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="80 126"
            className="origin-center"
          />
        </svg>

        {/* Center icon (truck bouncing) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Truck
            className={cn(s.icon, "text-primary animate-bounce")}
            style={{ animationDuration: "1.5s" }}
          />
        </div>
      </div>

      {/* Text */}
      {text && (
        <span className={cn(s.text, "text-muted-foreground font-medium animate-pulse")}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {loader}
      </div>
    );
  }

  return loader;
}
