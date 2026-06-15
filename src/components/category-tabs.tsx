"use client";

import { CATEGORY_LABEL, CATEGORY_ORDER, type Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryTabs({
  active,
  counts,
  onChange,
}: {
  active: Category;
  counts: Record<Category, number>;
  onChange: (c: Category) => void;
}) {
  return (
    <nav className="flex flex-wrap justify-center gap-2">
      {CATEGORY_ORDER.map((cat) => {
        const isActive = cat === active;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            aria-pressed={isActive}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-semibold transition-colors",
              isActive
                ? "border-border bg-secondary text-foreground shadow-sm"
                : "border-transparent bg-card/40 text-muted-foreground hover:bg-card hover:text-foreground",
            )}
          >
            {CATEGORY_LABEL[cat]}
            <span className="ml-1.5 text-xs text-muted-foreground/70">
              {counts[cat] ?? 0}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
