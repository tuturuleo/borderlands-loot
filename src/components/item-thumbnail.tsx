import {
  Bomb,
  HeartPulse,
  Shield,
  Sparkles,
  Swords,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { assetPath, cn } from "@/lib/utils";
import type { Category, LootItem, Rarity } from "@/lib/types";

const CATEGORY_ICON: Record<Category, LucideIcon> = {
  weapons: Swords,
  shields: Shield,
  ordnance: Bomb,
  repkits: HeartPulse,
  "class-mods": UserCog,
  enhancements: Sparkles,
};

const RARITY_RING: Record<Rarity, string> = {
  legendary: "ring-legendary/60",
  pearlescent: "ring-pearlescent/60",
};

const RARITY_GLOW: Record<Rarity, string> = {
  legendary: "text-legendary/40",
  pearlescent: "text-pearlescent/40",
};

export function ItemThumbnail({
  item,
  width = 96,
  height = 56,
  className,
}: {
  item: Pick<LootItem, "image" | "name" | "category" | "rarity">;
  width?: number;
  height?: number;
  className?: string;
}) {
  const Icon = CATEGORY_ICON[item.category];
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-black/30 ring-1 ring-inset",
        RARITY_RING[item.rarity],
        className,
      )}
      style={{ width, height }}
    >
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- статика на подпути Pages, basePath ставим вручную
        <img
          src={assetPath(item.image)}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <Icon className={cn("size-7", RARITY_GLOW[item.rarity])} aria-hidden />
      )}
    </div>
  );
}
