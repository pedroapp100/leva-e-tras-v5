import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Ícone de motocicleta personalizado para o Leva e Traz.
 * Substitui o caminhão em todos os pontos de branding.
 */
export function MotoIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    >
      {/* Roda traseira */}
      <circle cx="5.5" cy="17.5" r="3.5" />
      {/* Roda dianteira */}
      <circle cx="18.5" cy="17.5" r="3.5" />
      {/* Corpo / chassi */}
      <path d="M9 17.5l3-7h3l2 3.5" />
      {/* Guidão */}
      <path d="M15 10.5l4 1.5" />
      {/* Banco */}
      <path d="M7 14h5" />
      {/* Escapamento */}
      <path d="M5.5 14l-2-2" />
      {/* Farol */}
      <path d="M19 13.5l1.5-1" />
      {/* Motor */}
      <path d="M11 14l1 3.5" />
    </svg>
  );
}
