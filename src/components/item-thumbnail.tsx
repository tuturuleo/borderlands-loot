import Image from "next/image";
import {
  Bomb,
  HeartPulse,
  Shield,
  Sparkles,
  Swords,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  size = 56,
  className,
}: {
  item: Pick<LootItem, "image" | "name" | "category" | "rarity">;
  size?: number;
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
      style={{ width: size, height: size }}
    >
      {item.image ? (
        <Image
          src={item.image}
          alt={item.name}
          width={size * 2}
          height={size * 2}
          className="h-full w-full object-contain"
        />
      ) : (
        <Icon
          className={cn("size-1/2", RARITY_GLOW[item.rarity])}
          aria-hidden
        />
      )}
    </div>
  );
}
