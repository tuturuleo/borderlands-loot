import {
  Biohazard,
  Crosshair,
  Flame,
  Radiation,
  Snowflake,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { ElementKey } from "./types";

// Иконка + цветовой токен (см. globals.css) для каждой стихии.
export const ELEMENT_CONFIG: Record<
  ElementKey,
  { icon: LucideIcon; color: string }
> = {
  kinetic: { icon: Crosshair, color: "var(--color-elem-kinetic)" },
  fire: { icon: Flame, color: "var(--color-elem-fire)" },
  shock: { icon: Zap, color: "var(--color-elem-shock)" },
  corrosive: { icon: Biohazard, color: "var(--color-elem-corrosive)" },
  cryo: { icon: Snowflake, color: "var(--color-elem-cryo)" },
  radiation: { icon: Radiation, color: "var(--color-elem-radiation)" },
};
