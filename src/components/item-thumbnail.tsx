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
import type { Category, LootItem } from "@/lib/types";

const CATEGORY_ICON: Record<Category, LucideIcon> = {
  weapons: Swords,
  shields: Shield,
  ordnance: Bomb,
  repkits: HeartPulse,
  "class-mods": UserCog,
  enhancements: Sparkles,
};

export function ItemThumbnail({
  item,
  width = 130,
  height = 70,
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
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-md",
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
        <Icon className="size-7" aria-hidden />
      )}
    </div>
  );
}
