"use client";

import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ELEMENT_CONFIG } from "@/lib/element-config";
import {
  ELEMENT_LABEL,
  ELEMENT_ORDER,
  RARITY_LABEL,
  type Category,
  type ElementKey,
  type LootItem,
  type Rarity,
} from "@/lib/types";
import {
  activeFilterCount,
  EMPTY_FILTERS,
  type LootFilters,
} from "@/lib/filter";
import { cn } from "@/lib/utils";

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value)
    ? arr.filter((v) => v !== value)
    : [...arr, value];
}

function distinct(list: LootItem[], pick: (i: LootItem) => string | null) {
  const set = new Set<string>();
  for (const i of list) {
    const v = pick(i);
    if (v) set.add(v);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "ru"));
}

function CheckboxGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  if (options.length < 2) return null;
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-1.5">
        {options.map((opt) => {
          const id = `${title}-${opt}`;
          return (
            <div key={opt} className="flex items-center gap-2">
              <Checkbox
                id={id}
                checked={selected.includes(opt)}
                onCheckedChange={() => onToggle(opt)}
              />
              <Label
                htmlFor={id}
                className="cursor-pointer text-sm font-normal text-foreground/90"
              >
                {opt}
              </Label>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function FilterSidebar({
  items,
  category,
  filters,
  onChange,
}: {
  items: LootItem[];
  category: Category;
  filters: LootFilters;
  onChange: (next: LootFilters) => void;
}) {
  const facets = useMemo(() => {
    const rarities = distinct(items, (i) => i.rarity) as Rarity[];
    const types = distinct(items, (i) => i.type || i.typeEn);
    const manufacturers = distinct(items, (i) => i.manufacturer);
    const contents = distinct(items, (i) => i.content);
    const regions = distinct(items, (i) => i.region);
    const elements = ELEMENT_ORDER.filter((e) =>
      items.some((i) => i.elements.includes(e)),
    );
    return { rarities, types, manufacturers, contents, regions, elements };
  }, [items]);

  const set = (patch: Partial<LootFilters>) =>
    onChange({ ...filters, ...patch });

  const count = activeFilterCount(filters);
  const showElements = category === "weapons" && facets.elements.length > 0;

  return (
    <aside className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Фильтры</h2>
        {count > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={() => onChange(EMPTY_FILTERS)}
          >
            Сбросить ({count})
          </Button>
        )}
      </div>

      {/* Rarity */}
      {facets.rarities.length > 1 && (
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Редкость
          </h3>
          <div className="space-y-1.5">
            {facets.rarities.map((r) => {
              const id = `rarity-${r}`;
              return (
                <div key={r} className="flex items-center gap-2">
                  <Checkbox
                    id={id}
                    checked={filters.rarity.includes(r)}
                    onCheckedChange={() =>
                      set({ rarity: toggle(filters.rarity, r) })
                    }
                  />
                  <Label
                    htmlFor={id}
                    className="cursor-pointer text-sm font-normal text-foreground/90"
                  >
                    {RARITY_LABEL[r]}
                  </Label>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Elements (только оружие) */}
      {showElements && (
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Стихии
          </h3>
          <div className="flex flex-wrap gap-2">
            {facets.elements.map((e: ElementKey) => {
              const { icon: Icon, color } = ELEMENT_CONFIG[e];
              const on = filters.elements.includes(e);
              return (
                <button
                  key={e}
                  type="button"
                  title={ELEMENT_LABEL[e]}
                  onClick={() => set({ elements: toggle(filters.elements, e) })}
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-full ring-1 ring-inset transition",
                    on
                      ? "ring-2"
                      : "opacity-50 ring-white/10 hover:opacity-100",
                  )}
                  style={{
                    backgroundColor: `color-mix(in oklch, ${color} ${on ? 30 : 18}%, transparent)`,
                    ...(on ? { boxShadow: `inset 0 0 0 2px ${color}` } : {}),
                  }}
                  aria-pressed={on}
                >
                  <Icon className="size-4" style={{ color }} aria-hidden />
                </button>
              );
            })}
          </div>
        </section>
      )}

      <CheckboxGroup
        title={category === "weapons" ? "Тип оружия" : "Тип"}
        options={facets.types}
        selected={filters.types}
        onToggle={(v) => set({ types: toggle(filters.types, v) })}
      />

      <CheckboxGroup
        title="Производитель"
        options={facets.manufacturers}
        selected={filters.manufacturers}
        onToggle={(v) => set({ manufacturers: toggle(filters.manufacturers, v) })}
      />

      <CheckboxGroup
        title="Контент"
        options={facets.contents}
        selected={filters.contents}
        onToggle={(v) => set({ contents: toggle(filters.contents, v) })}
      />

      <CheckboxGroup
        title="Регион"
        options={facets.regions}
        selected={filters.regions}
        onToggle={(v) => set({ regions: toggle(filters.regions, v) })}
      />

      <Separator />

      {/* Тоглы */}
      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="worldDrop"
            checked={filters.worldDropOnly}
            onCheckedChange={(c) => set({ worldDropOnly: c === true })}
          />
          <Label
            htmlFor="worldDrop"
            className="cursor-pointer text-sm font-normal text-foreground/90"
          >
            Только ворлд-дроп
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="phosphene"
            checked={filters.phospheneOnly}
            onCheckedChange={(c) => set({ phospheneOnly: c === true })}
          />
          <Label
            htmlFor="phosphene"
            className="cursor-pointer text-sm font-normal text-foreground/90"
          >
            Только с Фосфеном
          </Label>
        </div>
      </section>
    </aside>
  );
}
